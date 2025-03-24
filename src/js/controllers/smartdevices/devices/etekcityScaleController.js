(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EtekcityScaleController', EtekcityScaleController);

        EtekcityScaleController.$inject = [
        '$scope', '$filter', '$timeout', 'NavigatorParameters', 'RequestToServer', 'Params', 'User'
    ];

    /* @ngInject */
    function EtekcityScaleController($scope, $filter, $timeout, NavigatorParameters, RequestToServer, Params, User)
    {
        // UUIDs for smart scale
        const SERVICE_UUID = 'FFE0';
        const BATTERY_SERVICE_UUID = '180F';
        const BATTERY_CHARACTERISTIC_UUID = '2A19';
        const NOTIFICATION_SERVICE_UUID = 'FFF0';
        const NOTIFICATION_CHARACTERISTIC_UUID = 'FFF1';
        const WRITE_CHARACTERISTIC_UUID = 'FFF2';

        // Error messages
        const ERROR_BACKEND = $filter('translate')('SMARTDEVICES_ERROR_BACKEND');
        const ERROR_NO_DEVICE = $filter('translate')('SMARTDEVICES_ERROR_NO_DEVICE');
        const ERROR_NO_DATA = $filter('translate')('SMARTDEVICES_ERROR_NO_DATA');

        const SAMPLE_TYPE_WEIGHT = 'BM';
        const UNIT_KG = 1;

        let vm = this;

        vm.scanning = false;
        vm.weight = null;
        // vm.weight = 13.45;
        vm.dataSubmitted = false;
        vm.debug = false;
        vm.selectedDevice = null;
        // vm.selectedDevice = {name: 'QN-Scale', id: '1234-5678-aaaa-bbbb', battery: 91};
        vm.errorMessage = null;
        // vm.errorMessage = `${ERROR_BACKEND}: Patient not found`;
        
        vm.devices = [];
        // vm.devices.push({
        //     name: 'QN-Scale',
        //     id: 'XXXX-YYY-ZZZZ-AAAA',
        // })
        // vm.devices.push({
        //     name: 'QN-Scale',
        //     id: 'YYYY-ZZZZ-AAAA-BBBB',
        // })
        vm.messages = [];

        vm.scanAndConnect = scanAndConnect;
        vm.selectDevice = selectDevice;
        vm.submitData = submitData;
        vm.showInstructions = !vm.scanning && vm.selectedDevice == null && vm.devices.length == 0;
        vm.isLoading = vm.scanning && vm.selectedDevice == null;
        vm.done = () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices.html');

        async function submitData() {
            addDebugMessage('Sending weight to backend');

            let data = {
                value: vm.weight,
                type: SAMPLE_TYPE_WEIGHT,
                start_date: new Date().toISOString(),
                source: vm.selectedDevice.name,
            };

            const patient_id = User.getLoggedinUserProfile().patient_id;
            const requestParams = Params.API.ROUTES.QUANTITY_SAMPLES;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_ID>', patient_id),
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
            vm.devices = [];

            await ble.withPromises.startScan([SERVICE_UUID], onDiscovered, onScanFailed);

            // stop scanning after 3 seconds
            $timeout(async () => {
                vm.scanning = false;
                await ble.withPromises.stopScan();

                // not sure why but without this the error message does not show
                $timeout(async () => {
                    if (vm.devices.length == 1) {
                        selectDevice(vm.devices.at(0));
                    } else if (vm.devices.length == 0) {
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
                // sometimes, not always, the device shows up twice, prevent this from happening
                if (vm.devices.indexOf(peripheralData) === -1) {
                    vm.devices.push(peripheralData);
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
                device.connecting = false;

                await ble.withPromises.disconnect(device.id);
            }, 10000);
        }

        async function onConnected(device, result) {
            addMessage(`Connected to device`);

            let batteryBuffer = await ble.withPromises.read(result.id, BATTERY_SERVICE_UUID, BATTERY_CHARACTERISTIC_UUID);
            let bytes = new Uint8Array(batteryBuffer);
            device.battery = bytes;
            addMessage(`Battery level: ${bytes}%`);   
            
            addDebugMessage('Subscribing to receive notifications');
            await ble.withPromises.startNotification(result.id, NOTIFICATION_SERVICE_UUID, NOTIFICATION_CHARACTERISTIC_UUID, (data) => {
                onSubscribeSuccess(result.id, data);
            }, onSubscribeError);

            $timeout(async () => {
                if (!vm.weight) {
                    addMessage('No data retrieved from device, please redo the measurement.')
                    vm.errorMessage = ERROR_NO_DATA;
                }

                addDebugMessage('Unsubscribing from notifications');
                await ble.withPromises.stopNotification(result.id, NOTIFICATION_SERVICE_UUID, NOTIFICATION_CHARACTERISTIC_UUID);
                addMessage('Disconnecting from device');
                await ble.withPromises.disconnect(result.id);

                $timeout(() => {
                    device.connecting = false;
                });
            }, 5000);
        }

        async function onSubscribeSuccess(device_id, result) {
            let value = new Uint8Array(result);

            let packetType = value[0];
            addDebugMessage(`Received raw message: ${toHexString(value)}`);

            if (packetType === 0x12) {
                addDebugMessage('Device says hello');
                // send configure response with unit = kg
                let response = new Uint8Array([0x13, 9, 21, UNIT_KG, 16, 170, 22, 0, 2]);
                addDebugMessage(`Sending response: ${toHexString(response)}`);

                await ble.withPromises.write(device_id, SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, response.buffer);
            } else if (packetType === 0x14) {
                addDebugMessage('Device responded with unknown packet type')
                // send response with timestamp with current time instead of hard-coded timestamp
                // in seconds
                const Y2K_START = 946684800;
                // time is returned in milliseconds
                let timestamp = (Date.now() / 1000) - Y2K_START
                // TODO: currently a hard-coded time, use the actual timestamp
                // Python equivalent to: struct.pack("<I", int(timestamp))
                // see: https://github.com/banksy-git/etekcity_scale/blob/master/etekcity_scale/packet.py#L50
                let response = new Uint8Array([0x20, 8, 0x15, 65, 239, 255, 42, 150]);
                addDebugMessage(`Sending response: ${toHexString(response)}`);

                await ble.withPromises.write(device_id, SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, response.buffer);
            } else if (packetType == 0x21) {
                // no response necessary it seems, the device sends the next package (measurement) anyway
                addDebugMessage('Device responded with second unknown packet type');
            } else if (packetType == 0x10) {
                addDebugMessage('Device responded with measurement packet');

                if (value[5] === 1) {
                    addDebugMessage('Received final measurement');
                    
                    // the weight is at index 3 and 4
                    let weightArray = value.slice(3, 5);
                    // convert to hex string
                    // see: https://github.com/LinusU/array-buffer-to-hex/blob/master/index.js
                    let weightHexString = '';

                    weightArray.forEach(element => {
                        weightHexString += element.toString(16);
                    });

                    // convert to hex to int and convert to kg
                    let weight = parseInt(weightHexString, 16) / 100;

                    addMessage(`Weight: ${weight} kg`);
                    vm.weight = weight;

                    let response = new Uint8Array([0x1f, 0x5, 0x15, 0x10, 0x49]);

                    await ble.withPromises.write(device_id, SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, response.buffer);
                    addDebugMessage('Told the device to stop spamming me');
                }
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
