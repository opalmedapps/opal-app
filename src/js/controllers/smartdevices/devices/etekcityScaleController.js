(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EtekcityScaleController', EtekcityScaleController);

        EtekcityScaleController.$inject = [
        '$scope', '$filter', '$timeout', 'Navigator', 'RequestToServer', 'Params', 'ProfileSelector'
    ];

    /* @ngInject */
    function EtekcityScaleController($scope, $filter, $timeout, Navigator, RequestToServer, Params, ProfileSelector)
    {
        // UUIDs for smart scale
        const SERVICE_UUID = 'FFE0';
        const BATTERY_SERVICE_UUID = '180F';
        const BATTERY_CHARACTERISTIC_UUID = '2A19';
        const SCALE_SERVICE_UUID = 'FFF0';
        const NOTIFICATION_CHARACTERISTIC_UUID = 'FFF1';
        const WRITE_CHARACTERISTIC_UUID = 'FFF2';

        // Error messages
        const ERROR_BACKEND = $filter('translate')('SMARTDEVICES_ERROR_BACKEND');
        const ERROR_NO_DEVICE = $filter('translate')('SMARTDEVICES_ERROR_NO_DEVICE');
        const ERROR_NO_DATA = $filter('translate')('SMARTDEVICES_ERROR_NO_DATA');

        // body mass
        const SAMPLE_TYPE_WEIGHT = 'BM';
        // the patient
        const SAMPLE_SOURCE = 'P';
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
                source: 'P',
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

            let batteryBuffer = await ble.withPromises.read(result.id, BATTERY_SERVICE_UUID, BATTERY_CHARACTERISTIC_UUID);
            let bytes = new Uint8Array(batteryBuffer);
            device.battery = bytes;
            addMessage(`Battery level: ${bytes}%`);   
            
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
                await ble.withPromises.write(device_id, SCALE_SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, response.buffer);
            } else if (packetType === 0x14) {
                addDebugMessage('Device responded with unknown packet type')
                
                let response = mergeArraysWithChecksum([0x20, 8, 0x15], dateToBytes());
                addDebugMessage(`Sending response: ${toHexString(response)}`);

                await ble.withPromises.write(device_id, SCALE_SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, response.buffer);
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

                    await ble.withPromises.write(device_id, SCALE_SERVICE_UUID, WRITE_CHARACTERISTIC_UUID, response.buffer);
                    addDebugMessage('Told the device to stop spamming me');

                    unsubscribe(device.id);
                    disconnect(device);
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

        function dateToBytes() {
            // send response with timestamp with current time instead of hard-coded timestamp
            // in seconds
            const struct = require('python-struct');

            const Y2K_START = 946684800;
            // time is returned in milliseconds
            let timestamp = (Date.now() / 1000) - Y2K_START;

            // Python equivalent to: struct.pack("<I", int(timestamp))
            // see: https://github.com/banksy-git/etekcity_scale/blob/master/etekcity_scale/packet.py#L50
            return struct.pack('<I', parseInt(timestamp));
        }

        function mergeArraysWithChecksum(array1, array2) {
            // sum of individual array lengths plus an element for the checksum
            length = array1.length + array2.length;
            let mergedArray = new Uint8Array(length + 1);
            mergedArray.set(array1);
            mergedArray.set(array2, array1.length);

            let checksum = mergedArray.reduce((partialSum, value) => partialSum + value, 0) & 0xFF;
            mergedArray.set([checksum], length);

            return mergedArray;
        }
    }
})();
