(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('EtekcityScaleController', EtekcityScaleController);

        EtekcityScaleController.$inject = [
        '$scope', '$timeout', '$filter', 'NativeNotification', 'NavigatorParameters', 'RequestToServer', 'Params', 'User'
    ];

    /* @ngInject */
    function EtekcityScaleController($scope, $timeout, $filter, NativeNotification, NavigatorParameters, RequestToServer, Params, User)
    {
        // UUIDs for smart scale
        const SERVICE_UUID = 'FFE0';
        const BATTERY_SERVICE_UUID = '180F';
        const BATTERY_CHARACTERISTIC_UUID = '2A19';
        const NOTIFICATION_SERVICE_UUID = 'FFF0';
        const NOTIFICATION_CHARACTERISTIC_UUID = 'FFF1';

        // Error messages
        const ERROR_NO_DEVICE = 'No device found. Please redo the measurement and try again.';
        const ERROR_BACKEND = 'Error sending weight to hospital: ';

        let vm = this;

        // TODO: switch back to false
        vm.scanning = false;
        // TODO: switch back to null
        vm.weight = null;
        vm.weight = 13.45;
        vm.dataSubmitted = true;
        // TODO: switch back to false
        vm.debug = false;
        // TODO: switch back to null
        // vm.selectedDevice = null;
        vm.selectedDevice = {name: 'QN-Scale', id: '1234-5678-aaaa-bbbb', battery: 91};
        // TODO: switch back to null
        vm.errorMessage = null;
        // vm.errorMessage = `${ERROR_BACKEND}Patient not found`;
        
        vm.devices = [];
        vm.devices.push({
            name: 'QN-Scale',
            id: 'XXXX',
        })
        vm.devices.push({
            name: 'QN-Scale',
            id: 'YYYY',
        })
        vm.messages = [];

        vm.scanAndConnect = scanAndConnect;
        vm.selectDevice = selectDevice;
        vm.submitData = submitData;
        vm.shouldShowInstructions = () => !vm.scanning && vm.selectedDevice == null && vm.devices.length == 0;
        vm.isLoading = () => vm.scanning && vm.selectedDevice == null;
        vm.done = () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices.html');

        async function submitData() {
            addDebugMessage('Sending weight to backend');

            let data = {
                value: vm.weight,
                type: 'BM',
                start_date: new Date().toISOString(),
                source: 'QN-Scale',
            }

            // const patient_id = 51;
            const patient_id = User.getLoggedinUserProfile().patient_id;
            const requestParams = Params.API.ROUTES.QUANTITY_SAMPLES;
            const formattedParams = {
                ...requestParams,
                url: requestParams.url.replace('<PATIENT_ID>', patient_id),
            }

            try {
                let result = await RequestToServer.apiRequest(formattedParams, JSON.stringify(data));
                console.log(result);
                addMessage('Weight successfully sent to backend');
                // NativeNotification.showNotificationAlert(
                //     `Weight successfully sent to backend`, 
                //     () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices.html')
                // )
                vm.dataSubmitted = true;

            } catch (error) {
                console.log('error while sending weight to backend: ', error);
                // NativeNotification.showNotificationAlert(`Error sending weight to hospital: ${error}`)
                vm.errorMessage = `Error sending weight to hospital: ${error}`;
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
                        // vm.errorMessage = 'No device detected';
                        NativeNotification.showNotificationAlert('No device found. Please redo the measurement and try again.');
                    }
                })
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

        async function selectDevice(device) {
            console.log('selectDevice')
            device.connecting = true;
            vm.selectedDevice = device;

            vm.weight = null;
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
            device.battery = bytes;
            addMessage(`Battery level: ${bytes}%`);   
            
            addDebugMessage('Subscribing to receive notifications');
            await ble.withPromises.startNotification(result.id, NOTIFICATION_SERVICE_UUID, NOTIFICATION_CHARACTERISTIC_UUID, (data) => {
                onSubscribeSuccess(result.id, data);
            }, onSubscribeError);

            $timeout(async () => {
                if (!vm.weight) {
                    addMessage('No data retrieved from device, please redo the measurement.')
                    NativeNotification.showNotificationAlert('No data retrieved from device, please redo the measurement.')
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
                    vm.weight = weight;
                    vm.scanning = false;

                    let response = new Uint8Array([0x1f, 0x5, 0x15, 0x10, 0x49]);

                    console.log('sending stop spam message ', response); 

                    await ble.withPromises.write(device_id, service_uuid, characteristic_uuid, response.buffer);
                    addDebugMessage('Told the device to stop spamming me');

                    // NativeNotification.showConfirmation(`Do you want to send the weight (${weight} kg) to the hospital?`, async () => {
                    //     if (!vm.debug) {
                    //         addDebugMessage('Sending weight to backend');
    
                    //         let data = {
                    //             value: weight,
                    //             type: 'BM',
                    //             start_date: new Date().toISOString(),
                    //             source: 'QN-Scale',
                    //         }
    
                    //         const patient_id = User.getLoggedinUserProfile().patient_id;
                    //         const requestParams = Params.API.ROUTES.QUANTITY_SAMPLES;
                    //         const formatedParams = {
                    //             ...requestParams,
                    //             url: requestParams.url.replace('<PATIENT_ID>', patient_id),
                    //         }
                
                    //         console.log(formatedParams);
                
                
                    //         let result = await RequestToServer.apiRequest(formatedParams, JSON.stringify(data));
                    //         console.log(result);
                    //         addMessage('Weight successfully sent to backend');
                    //     } else {
                    //         addDebugMessage('Debug mode: Weight not sent to backend');
                    //     }
                    // });

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
