(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SmartDevicesController', SmartDevicesController);

    SmartDevicesController.$inject = [
        '$scope', '$timeout', 'NavigatorParameters',
    ];

    /* @ngInject */
    function SmartDevicesController($scope, $timeout,NavigatorParameters)
    {
        let vm = this;
        
        vm.showInfo = () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices-info.html');
        // TODO: switch back to false
        vm.bluetoothEnabled = true;
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
    }
})();
