(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SmartDevicesController', SmartDevicesController);

    SmartDevicesController.$inject = [
        '$scope', '$timeout', '$filter', 'NativeNotification', 'NavigatorParameters', 'RequestToServer', 'Params', 'User'
    ];

    /* @ngInject */
    function SmartDevicesController($scope, $timeout, $filter, NativeNotification, NavigatorParameters, RequestToServer, Params, User)
    {
        // UUIDs for smart scale
        const SERVICE_UUID = 'FFE0';
        const BATTERY_SERVICE_UUID = '180F';
        const BATTERY_CHARACTERISTIC_UUID = '2A19';
        const NOTIFICATION_SERVICE_UUID = 'FFF0';
        const NOTIFICATION_CHARACTERISTIC_UUID = 'FFF1';

        let vm = this;
        
        vm.showInfo = () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices-info.html');
        // TODO: switch back to false
        vm.bluetoothEnabled = true;
        vm.scanning = false;
        vm.devices = [];
        vm.messages = [];
        vm.dataRetrieved = false;

        vm.scan = scan;
        vm.connect = connect;
        vm.refresh = isBluetoothEnabled;

        initializeBluetooth();
        // if it is checked right after it might report that bluetooth is disabled even though it is enabled
        // delay it a little bit
        $timeout(() => isBluetoothEnabled(), 50);

        async function initializeBluetooth() {
            console.log('initializing bluetooth...')
            // initialize Bluetooth stack by calling a function once
            // otherwise it can error out occasionally when scanning
            await ble.withPromises.isEnabled();
        }

        function isBluetoothEnabled() {
            // need to use non-promisified API since the promisified one does not return anything
            console.log('checking whether BLE is enabled');
            ble.isEnabled(
                () => {
                    console.log('BLE enabled');
                    $timeout(() => vm.bluetoothEnabled = true);
                },
                (error) => {
                    console.log('BLE enabled error', error);
                    $timeout(() => vm.bluetoothEnabled = false);
                }
            )
        }

        async function scan() {
            vm.scanning = true;
            vm.messages = [];
            vm.devices = [];

            await ble.withPromises.startScan([SERVICE_UUID], onDiscovered, onScanFailed);

            // stop scanning after 3 seconds
            $timeout(async () => {
                vm.scanning = false;
                await ble.withPromises.stopScan();
            }, 3000);
        }

        function onScanFailed(error) {
            console.log(error);

            $timeout(() => vm.scanning = false);

            addMessage(`Error scanning: ${error}`);
        }

        function onDiscovered(peripheralData) {
            console.log('on discovered');
            console.log(peripheralData);
            $timeout(() => {
                console.log(vm.devices.indexOf(peripheralData));
                // sometimes, not always, the device shows up twice, prevent this from happening
                if (vm.devices.indexOf(peripheralData) === -1) {
                    vm.devices.push(peripheralData);
                }
            })
        }

        async function connect(device) {
            device.connecting = true;
            vm.dataRetrieved = false;
            vm.messages = [];

            addMessage(`Connecting to ${device.name} (${device.id}) ...`);

            console.log('connecting...');

            await ble.withPromises.connect(device.id, (data) => {
                onConnected(device, data);
            }, (error) => {
                console.log('error connecting');
                console.log(error);
            })

            console.log('connected...');
            $timeout(async () => {
                console.log('disconnect...');
                device.connecting = false;

                await ble.withPromises.disconnect(device.id);
            }, 10000);
        }

        async function onConnected(device, result) {
            console.log('onConnected');
            console.log(result);

            addMessage(`Connected to device`);

            let batteryBuffer = await ble.withPromises.read(result.id, BATTERY_SERVICE_UUID, BATTERY_CHARACTERISTIC_UUID);
            let bytes = new Uint8Array(batteryBuffer);
            addMessage(`Battery level: ${bytes}%`);   
            
            addDebugMessage('Subscribing to receive notifications');
            await ble.withPromises.startNotification(result.id, NOTIFICATION_SERVICE_UUID, NOTIFICATION_CHARACTERISTIC_UUID, (data) => {
                onSubscribeSuccess(result.id, data);
            }, onSubscribeError);

            $timeout(async () => {
                if (!vm.dataRetrieved) {
                    addMessage('No data retrieved from device, please redo the measurement.')
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
            console.log('onSubscribeSuccess');
            let value = new Uint8Array(result);
            console.log(value);

            let packetType = value[0];
            const service_uuid = 'FFF0';
            const characteristic_uuid = 'FFF2'
            addDebugMessage(`Received raw message: ${toHexString(value)}`);

            if (packetType === 0x12) {
                // receivedHello = true;
                console.log('hello from device');
                addDebugMessage('Device says hello');
                // send configure response with unit = kg
                let unit = 1;
                let response = new Uint8Array([0x13, 9, 21, unit, 16, 170, 22, 0, 2]);
                console.log('response: ', response);
                addDebugMessage(`Sending response: ${toHexString(response)}`);

                await ble.withPromises.write(device_id, service_uuid, characteristic_uuid, response.buffer);
                console.log('successfully sent');
            } else if (packetType === 0x14) {
                console.log('received unknown packet')
                addDebugMessage('Device responded with unknown packet type')
                // send response with timestamp with current time instead of hard-coded timestamp
                // in seconds
                const Y2K_START = 946684800;
                // time is returned in milliseconds
                let timestamp = (Date.now() / 1000) - Y2K_START
                // TODO: use timestamp
                let response = new Uint8Array([0x20, 8, 0x15, 65, 239, 255, 42, 150]);
                addDebugMessage(`Sending response: ${toHexString(response)}`);

                await ble.withPromises.write(device_id, service_uuid, characteristic_uuid, response.buffer);
            } else if (packetType == 0x21) {
                console.log('received another unknown packet');
                addDebugMessage('Device responded with second unknown packet type');
                // no response necessary it seems, the device sends the next package (measurement) anyway
            } else if (packetType == 0x10) {
                console.log('received measurement packet');
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
                    vm.dataRetrieved = true;

                    let response = new Uint8Array([0x1f, 0x5, 0x15, 0x10, 0x49]);

                    console.log('sending stop spam message ', response); 

                    await ble.withPromises.write(device_id, service_uuid, characteristic_uuid, response.buffer);
                    addDebugMessage('Told the device to stop spamming me');

                    NativeNotification.showConfirmation(`Do you want to send the weight (${weight} kg) to the hospital?`, async () => {
                        if (!vm.debug) {
                            addDebugMessage('Sending weight to backend');
    
                            let data = {
                                value: weight,
                                type: 'BM',
                                start_date: new Date().toISOString(),
                                source: 'QN-Scale',
                            }
    
                            const patient_id = User.getLoggedinUserProfile().patient_id;
                            const requestParams = Params.API.ROUTES.QUANTITY_SAMPLES;
                            const formatedParams = {
                                ...requestParams,
                                url: requestParams.url.replace('<PATIENT_ID>', patient_id),
                            }
                
                            console.log(formatedParams);
                
                
                            let result = await RequestToServer.apiRequest(formatedParams, JSON.stringify(data));
                            console.log(result);
                            addMessage('Weight successfully sent to backend');
                        } else {
                            addDebugMessage('Debug mode: Weight not sent to backend');
                        }
                    });

                }
            }
        }

        function onSubscribeError(result) {
            console.log('onSubscribeError');
            console.log(result);
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
            })

            return hexString;
        }
    }
})();
