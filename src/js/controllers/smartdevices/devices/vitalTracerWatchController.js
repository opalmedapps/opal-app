// import ble from "cordova-plugin-ble-central/src/browser/BLECentralPlugin.js";

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
        // $window.ble = ble;
        let vm = this;

        vm.scanning = false;
        vm.dataSubmitted = false;
        vm.debug = true;

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
            // await ble.startScanWithOptions([SERVICE_UUID], {}, onDiscovered, onScanFailed);

            // stop scanning after 3 seconds
            $timeout(async () => {
                vm.scanning = false;
                await ble.withPromises.stopScan();
                // await ble.stopScan();

                // not sure why but without this the error message does not show
                $timeout(async () => {
                    if (devices.size == 1) {
                        selectDevice(devices.values().next().value);
                    } else if (devices.size == 0) {
                        vm.errorMessage = ERROR_NO_DEVICE;
                    }
                });
            }, 5000);
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
            // await ble.connect(device.id, (data) => {
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
            
            // let batteryBuffer = await ble.withPromises.read(device.id, BATTERY_SERVICE_UUID, BATTERY_CHARACTERISTIC_UUID);
            // let batteryBuffer = await ble.read(device.id, BATTERY_SERVICE_UUID, BATTERY_CHARACTERISTIC_UUID);
            // let bytes = new Uint8Array(batteryBuffer);
            // device.battery = bytes;
            // addMessage(`Battery level: ${bytes}%`);   
            
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
                // if (!vm.weight) {
                //     addMessage('No data retrieved from device, please redo the measurement.')
                //     vm.errorMessage = ERROR_NO_DATA;
                //     // need to reset some variables to show the instructions
                //     vm.selectedDevice = null;
                //     devices.clear()
                // }

                unsubscribe(result.id);
                disconnect(device);
            }, 40000);
        }

        async function onSubscribeHeartRateSuccess(device, result) {
            let value = new Uint8Array(result);

            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            addDebugMessage(`Heart rate: ${value[1]}`);
            vm.heartRate = value[1];

            // unsubscribe(device.id);
            // disconnect(device);
        }

        async function onSubscribeBloodPressureSuccess(device, result) {
            let value = new Uint8Array(result);

            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            addDebugMessage(`Blood pressure: ${value[1]}`);
            vm.bloodPressure = value[1];

            // unsubscribe(device.id);
            // disconnect(device);
        }

        async function onSubscribeBatteryLevelSuccess(device, result) {
            let value = new Uint8Array(result);

            addDebugMessage(`Received raw message: ${toHexString(value)}`);
            addDebugMessage(`Battery level: ${value}`);
            vm.batteryLevel = value;

            // unsubscribe(device.id);
            // disconnect(device);
        }

        function onSubscribeError(result) {
            console.log('onSubscribeError: ', result);
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
