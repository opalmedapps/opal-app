(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SmartDevicesController', SmartDevicesController);

    SmartDevicesController.$inject = [
        '$scope', '$timeout', '$filter', 'NavigatorParameters', 'RequestToServer', 'Params', 'User'
    ];

    /* @ngInject */
    function SmartDevicesController($scope, $timeout, $filter, NavigatorParameters, RequestToServer, Params, User)
    {
        var vm = this;
        vm.debug = false;
        vm.bluetoothEnabled = true;
        vm.scanning = false;
        vm.devices = [];
        vm.toggleDebug = toggleDebug;
        vm.scan = scan;
        vm.connect = connect;
        vm.messages = [];

        // bluetoothle.initialize(onBluetoothStatusChanged);
        activate();

        async function activate() {
            await ble.withPromises.isEnabled();
        }

        async function scan() {
            vm.scanning = true;
            vm.messages = [];
            vm.devices = [];

            // bluetoothle.startScan(onStartScanSuccess, onScanFailed, {services: ['FFE0']});
            await ble.withPromises.startScan(['FFE0'], onDiscovered, onScanFailed);

            $timeout(async () => {
                vm.scanning = false;
                // bluetoothle.stopScan(onStopScanSuccess, onStopScanFailed);
                await ble.withPromises.stopScan();
            }, 3000);
        }

        function onScanFailed(error) {
            console.log(error);

            $timeout(() => {
                vm.scanning = false;
            });

            addMessage(`Error scanning: ${error}`);
        }

        function onDiscovered(peripheralData) {
            console.log('on discovered');
            console.log(peripheralData);
            $timeout(() => {
                vm.devices.push(peripheralData);
            })
        }

        async function connect(device) {
            device.connecting = true;
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

            let batteryBuffer = await ble.withPromises.read(result.id, '180F', '2A19');
            let bytes = new Uint8Array(batteryBuffer);
            addMessage(`Battery level: ${bytes}%`);   
            
            addDebugMessage('Subscribing to receive notifications');
            await ble.withPromises.startNotification(result.id, 'FFF0', 'FFF1', (data) => {
                onSubscribeSuccess(result.id, data);
            }, onSubscribeError);

            $timeout(async () => {
                addDebugMessage('Unsubscribing from notifications');
                await ble.withPromises.stopNotification(result.id, 'FFF0', 'FFF1');
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
                // let responseEncoded = bluetoothle.stringToBytes(response);
                // console.log(responseEncoded);
                // let responseEncoded = bluetoothle.bytesToEncodedString(response);
                // console.log(responseEncoded);
                // console.log('sending ', responseEncoded);
                // for some reason sending with "noResponse" does not work
                // let params = {address: result.address, service: result.service, characteristic: 'FFF2', value: responseEncoded, type: 'withResponse'};
                // console.log(params);
                // bluetoothle.write(onWriteSuccess, onWriteError, {...params, ...{value: responseEncoded}});
                await ble.withPromises.write(device_id, service_uuid, characteristic_uuid, response.buffer);
                console.log('successfully sent');
            } else if (packetType === 0x14) {
                console.log('received unknown packet')
                addDebugMessage('Device responded with unknown packet type')
                // send response with timestamp
                // in seconds
                const Y2K_START = 946684800;
                // time is returned in milliseconds
                let timestamp = (Date.now() / 1000) - Y2K_START
                let response = new Uint8Array([0x20, 8, 0x15, 65, 239, 255, 42, 150]);
                addDebugMessage(`Sending response: ${toHexString(response)}`);
                // let responseEncoded = bluetoothle.bytesToEncodedString(response);
                // bluetoothle.write(onWriteSuccess, onWriteError, {...params, ...{value: responseEncoded}});
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

                    let response = new Uint8Array([0x1f, 0x5, 0x15, 0x10, 0x49]);
                    // let responseEncoded = bluetoothle.bytesToEncodedString(response);
                    console.log('sending stop spam message ', response); 
                    // bluetoothle.write(onWriteSuccess, onWriteError, {...params, ...{value: responseEncoded}});
                    await ble.withPromises.write(device_id, service_uuid, characteristic_uuid, response.buffer);
                    addDebugMessage('Told the device to stop spamming me');

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
                }
            }
        }

        function onSubscribeError(result) {
            console.log('onSubscribeError');
            console.log(result);
        }

        function addMessage(message) {
            $timeout(() => {
                vm.messages.push(message);
            });
        }

        function toggleDebug() {
            vm.debug = !vm.debug;
        }

        function addDebugMessage(message) {
            if (vm.debug) {
                addMessage(message);
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
