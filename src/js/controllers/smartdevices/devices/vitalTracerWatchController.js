(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('VitalTracerWatchController', VitalTracerWatchController);

        VitalTracerWatchController.$inject = [
        '$scope', '$filter', '$timeout', 'NavigatorParameters', 'RequestToServer', 'Params', 'ProfileSelector', '$window'
    ];

    /* @ngInject */
    function VitalTracerWatchController($scope, $filter, $timeout, NavigatorParameters, RequestToServer, Params, ProfileSelector, $window)
    {
        // UUIDs for smart scale
        const SERVICE_UUID = '00EE';
        const BATTERY_SERVICE_UUID = '180F';
        const BATTERY_CHARACTERISTIC_UUID = '2A19';
        const HEART_RATE_SERVICE_UUID = '180D';
        const HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID = '2A37';
        const BLOOD_PRESSURE_SERVICE_UUID = '1810';
        const BLOOD_PRESSURE_CHARACTERISTIC_UUID = '2A35';

        // Error messages
        const ERROR_BACKEND = $filter('translate')('SMARTDEVICES_ERROR_BACKEND');
        const ERROR_NO_DEVICE = $filter('translate')('SMARTDEVICES_ERROR_NO_DEVICE');
        const ERROR_NO_DATA = $filter('translate')('SMARTDEVICES_ERROR_NO_DATA');

        const SAMPLE_TYPE_HEART_RATE = 'HR';
        const SAMPLE_TYPE_BLOOD_PRESSURE = 'HR';
        // the patient
        const SAMPLE_SOURCE = 'P';

        let vm = this;

        vm.scanning = false;
        vm.dataSubmitted = false;
        vm.debug = false;

        vm.selectedDevice = null;
        vm.errorMessage = null;
        
        let devices = new Map();
        vm.messages = [];

        vm.heartRate = null;
        vm.bloodPressure = null;
        vm.batteryLevel = null;

        vm.scanAndConnect = scanAndConnect;
        // for some reason using the same function name does not work
        vm.doSelectDevice = (device) => selectDevice(device);
        vm.showInstructions = () => !vm.scanning && vm.selectedDevice == null && devices.size == 0 && !vm.heartRate && !vm.bloodPressure;
        // show loading spinner while scanning and while reading data from device
        vm.isLoading = () => (vm.scanning && vm.selectedDevice == null) || (vm.selectedDevice?.connecting && !vm.heartRate && !vm.bloodPressure);
        vm.done = () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices.html');
        // ng-repeat does not support iterating through maps
        vm.getDeviceList = () => Array.from(devices.values());

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

            vm.messages = [];

            addMessage(`Connecting to ${device.name} (${device.id}) ...`);

            await ble.withPromises.connect(device.id, (data) => {
                onConnected(device, data);
            }, (error) => {
                console.log('connect error: ', error);
            })

            $timeout(async () => {
                disconnect(device);
            }, 30000);
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
            await ble.withPromises.startNotification(
                result.id,
                HEART_RATE_SERVICE_UUID,
                HEART_RATE_MEASUREMENT_CHARACTERISTIC_UUID,
                (data) => {
                    onSubscribeHeartRateSuccess(device, data);
                },
                onSubscribeError
            );
            await ble.withPromises.startNotification(
                result.id,
                BLOOD_PRESSURE_SERVICE_UUID,
                BLOOD_PRESSURE_CHARACTERISTIC_UUID,
                (data) => {
                    onSubscribeBloodPressureSuccess(device, data);
                },
                onSubscribeError
            );
            await ble.withPromises.startNotification(
                result.id,
                BATTERY_SERVICE_UUID,
                BATTERY_CHARACTERISTIC_UUID,
                (data) => {
                    onSubscribeBatteryLevelSuccess(device, data);
                },
                onSubscribeError
            );

            $timeout(async () => {
                if (!vm.heartRate && !vm.bloodPressure) {
                    addMessage('No data retrieved from device, please redo the measurement.')
                    vm.errorMessage = ERROR_NO_DATA;
                    // need to reset some variables to show the instructions
                    vm.selectedDevice = null;
                    devices.clear()
                }

                unsubscribe(result.id);
                disconnect(device);
            }, 40000);
        }

        async function onSubscribeHeartRateSuccess(device, result) {
            let value = new Uint8Array(result);

            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            addDebugMessage(`Heart rate: ${value[1]}`);
            vm.heartRate = value[1];
            submitData(SAMPLE_TYPE_HEART_RATE);
        }

        async function onSubscribeBloodPressureSuccess(device, result) {
            let value = new Uint8Array(result);

            // TODO: should read two values (e.g., 120/80 mmHg)
            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            addDebugMessage(`Blood pressure: ${value[1]}`);
            vm.bloodPressure = value[1];
            // TODO: uncomment and finalize once the backend supports blood pressure type (!690)
            // submitData(SAMPLE_TYPE_BLOOD_PRESSURE);
        }

        async function onSubscribeBatteryLevelSuccess(device, result) {
            let value = new Uint8Array(result);

            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            addDebugMessage(`Battery level: ${value}`);
            vm.batteryLevel = value;
        }

        function onSubscribeError(result) {
            console.log('onSubscribeError: ', result);
        }

        async function submitData(sample_type) {
            addDebugMessage('Sending the VitalTracer measurement to the backend');

            let data = {
                value: vm.heartRate,
                type: sample_type,
                start_date: new Date().toISOString(),
                source: SAMPLE_SOURCE,
                device: vm.selectedDevice.name,
            };

            const patient_id = ProfileSelector.getActiveProfile().patient_id;
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

        function addMessage(message) {
            console.log(message);
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
