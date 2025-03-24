(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('XiaomiScaleController', XiaomiScaleController);

    XiaomiScaleController.$inject = [
        '$scope', '$filter', '$timeout', 'Navigator', 'RequestToServer', 'Params', 'ProfileSelector'
    ];

    /* @ngInject */
    function XiaomiScaleController($scope, $filter, $timeout, Navigator, RequestToServer, Params, ProfileSelector)
    {
        // UUIDs for smart scale
        const SERVICE_UUID = '181D';
        const SCALE_SERVICE_UUID = '181D';
        const NOTIFICATION_CHARACTERISTIC_UUID = '2A9D';

        // Error messages
        const ERROR_BACKEND = $filter('translate')('SMARTDEVICES_ERROR_BACKEND');
        const ERROR_NO_DEVICE = $filter('translate')('SMARTDEVICES_SCALE_ERROR_NO_DEVICE');
        const ERROR_NO_DATA = $filter('translate')('SMARTDEVICES_ERROR_NO_DATA');

        // body mass
        const SAMPLE_TYPE_WEIGHT = 'BM';
        // the patient
        const SAMPLE_SOURCE = 'P';

        let vm = this;

        vm.scanning = false;
        vm.weight = null;
        vm.dataSubmitted = false;
        vm.debug = false;
        vm.selectedDevice = null;
        vm.errorMessage = null;
        
        let devices = new Map();
        vm.messages = [];

        vm.scanAndConnect = scanAndConnect;
        // for some reason using the same function name does not work
        vm.doSelectDevice = (device) => selectDevice(device);
        vm.submitData = submitData;
        vm.showInstructions = () => !vm.scanning && vm.selectedDevice == null && devices.size == 0 && !vm.weight;
        // show loading spinner while scanning and while reading data from device
        vm.isLoading = () => (vm.scanning && vm.selectedDevice == null) || (vm.selectedDevice?.connecting && !vm.weight);
        vm.done = () => Navigator.getNavigator().pushPage('./views/smartdevices/smartdevices.html');
        // ng-repeat does not support iterating through maps
        vm.getDeviceList = () => Array.from(devices.values());

        async function submitData() {
            addDebugMessage('Sending weight to backend');

            let data = {
                value: vm.weight,
                type: SAMPLE_TYPE_WEIGHT,
                start_date: new Date().toISOString(),
                source: SAMPLE_SOURCE,
                device: vm.selectedDevice.name,
            };

            const patient_uuid = ProfileSelector.getActiveProfile().patient_uuid;
            const requestParams = Params.API.ROUTES.QUANTITY_SAMPLES;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_UUID>', patient_uuid),
            };

            try {
                let result = await RequestToServer.apiRequest(formattedParams, JSON.stringify(data));
                
                addMessage('Weight successfully sent to backend');
                
                vm.dataSubmitted = true;
            } catch (error) {
                vm.errorMessage = `${ERROR_BACKEND}: ${error}`;
            }
        }

        async function scanAndConnect() {
            vm.scanning = true;
            vm.errorMessage = null;
                
            vm.selectDevice = null;
            vm.messages = [];
            devices.clear();

            await ble.withPromises.startScan([SERVICE_UUID], onDiscovered, onScanFailed);

            // stop scanning after 3 seconds
            $timeout(async () => {
                vm.scanning = false;
                await ble.withPromises.stopScan();

                // not sure why but without this the error message does not show
                $timeout(async () => {
                    if (devices.size == 1) {
                        selectDevice(devices.values().next().value);
                    } else if (devices.size == 0) {
                        vm.errorMessage = ERROR_NO_DEVICE;
                    }
                });
            }, 3000);
        }

        function onScanFailed(error) {
            $timeout(() => vm.scanning = false);

            addMessage(`Error scanning: ${error}`);
        }

        function onDiscovered(peripheralData) {
            $timeout(() => {
                if (!devices.has(peripheralData.id)) {
                    devices.set(peripheralData.id, peripheralData);
                }
            });
        }

        async function selectDevice(device) {
            device.connecting = true;
            vm.selectedDevice = device;

            vm.weight = null;
            vm.messages = [];

            addMessage(`Connecting to ${device.name} (${device.id}) ...`);

            await ble.withPromises.connect(device.id, (data) => {
                onConnected(device, data);
            }, (error) => {
                console.log('connect error: ', error);
            })

            $timeout(async () => {
                disconnect(device);
            }, 10000);
        }

        async function unsubscribe(device_id) {
            addDebugMessage('Unsubscribing from notifications');
            await ble.withPromises.stopNotification(device_id, SCALE_SERVICE_UUID, NOTIFICATION_CHARACTERISTIC_UUID);
        }

        async function disconnect(device) {
            addMessage('Disconnecting from device');

            $timeout(() => {
                device.connecting = false;
                devices.clear();
            });
            
            await ble.withPromises.disconnect(device.id);
        }

        async function onConnected(device, result) {
            addMessage(`Connected to device`);
            
            addDebugMessage('Subscribing to receive notifications');
            await ble.withPromises.startNotification(result.id, SCALE_SERVICE_UUID, NOTIFICATION_CHARACTERISTIC_UUID, (data) => {
                onSubscribeSuccess(result.id, data);
            }, onSubscribeError);

            $timeout(async () => {
                if (!vm.weight) {
                    addMessage('No data retrieved from device, please redo the measurement.')
                    vm.errorMessage = ERROR_NO_DATA;
                    // need to reset some variables to show the instructions
                    vm.selectedDevice = null;
                    devices.clear()
                }

                unsubscribe(result.id);
                disconnect(device);
            }, 7000);
        }

        async function onSubscribeSuccess(device_id, result) {
            let value = new Uint8Array(result);

            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            
            // Xiaomi Mi Scale info: https://github.com/oliexdev/openScale/wiki/Xiaomi-Bluetooth-Mi-Scale
            if (value[0] === 0x22) {
                addDebugMessage('Received final measurement');
                
                // the weight is at index 1 and 2 in little endian format
                let weightArray = value.slice(1, 3);
                weightArray.reverse();

                // convert to hex string
                // see: https://github.com/LinusU/array-buffer-to-hex/blob/master/index.js
                let weightHexString = '';

                weightArray.forEach(element => {
                    weightHexString += element.toString(16);
                });

                // convert to hex to int and convert to kg
                let weight = parseInt(weightHexString, 16) / 200;

                addMessage(`Weight: ${weight} kg`);
                vm.weight = weight;

                unsubscribe(device.id);
                disconnect(device);
            }
        }

        function onSubscribeError(result) {
            console.log('onSubscribeError: ', result);
        }

        function addMessage(message) {
            $timeout(() => vm.messages.push(message))
        }

        function addDebugMessage(message, data = undefined) {
            if (vm.debug) {
                addMessage(message);
            }
            if (data) {
                console.log(`${message}: `, data);
            }
        }

        function toHexString(byteArray) {
            let hexString = '';

            byteArray.forEach(element => {
                let elementHex = element.toString(16);
                elementHex = (elementHex.length == 2) ? elementHex : `0${elementHex}`;
                hexString += ` 0x${elementHex}`;
            });

            return hexString;
        }
    }
})();
