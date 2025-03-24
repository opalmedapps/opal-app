(function () {
    'use strict';

    angular
        .module('MUHCApp')
        .controller('SmartDevicesController', SmartDevicesController);

    SmartDevicesController.$inject = [
        '$scope', '$timeout', 'NavigatorParameters',
    ];

    /* @ngInject */
    function SmartDevicesController($scope, $timeout, NavigatorParameters)
    {
        let vm = this;
        
        vm.showInfo = () => NavigatorParameters.getNavigator().pushPage('./views/smartdevices/smartdevices-info.html');
        vm.bluetoothAvailable = window.hasOwnProperty('ble');
        vm.bluetoothEnabled = false;
        vm.refresh = isBluetoothEnabled;

        // ble is only available on a native device currently
        if (vm.bluetoothAvailable) {
            initializeBluetooth();
            // if it is checked right away it might report that bluetooth is disabled even though it is enabled
            // delay it a little bit
            $timeout(() => isBluetoothEnabled(), 50);
        }

        async function initializeBluetooth() {
            // initialize Bluetooth stack by calling a function once
            // otherwise it can error out occasionally when scanning
            await ble.withPromises.isEnabled();
        }

        function isBluetoothEnabled() {
            // need to use non-promisified API since the promisified one does not return anything
            ble.isEnabled(
                () => {
                    $timeout(() => vm.bluetoothEnabled = true);
                },
                (error) => {
                    $timeout(() => vm.bluetoothEnabled = false);
                }
            )
        }
    }
})();
