/**
 * @description Manages the individual imaging views.
 * @author Kayla O'Sullivan-Steben
 * @date 2021
 */
(function () {
    'use strict';

    angular
        .module('OpalApp')
        .controller('IndividualImagingController', IndividualImagingController);

    IndividualImagingController.$inject = ['$filter', '$scope', '$timeout', 'Navigator', 'Radiotherapy', 'UserPreferences'];

    function IndividualImagingController($filter, $scope, $timeout, Navigator, Radiotherapy, UserPreferences) {
        let vm = this;

        vm.date = undefined;
        vm.files = []; // The list of image(s)
        vm.index = 1; // Index of current slice displayed
        vm.language = '';
        vm.loading = true
        vm.modality = '';
        vm.multiImage = false;

        vm.getSrc = getSrc;

        // Mapping the DICOM modality code to its name. TODO: this should probably be moved and needs french translations.
        // This list is non-exhaustive. Other codes: https://dicom.innolitics.com/ciods/ct-image/general-series/00080060
        let modalityMapping = {
            CT: 'CT',
            DX: 'X-Ray Radiograph',
            MG: 'Mammography',
            MR: 'MRI',
            US: 'Ultrasound',
            XA: 'X-Ray Angiography',
        }

        activate();

        ////////////////

        function activate() {
            let parameters = Navigator.getParameters();
            vm.language = UserPreferences.getLanguage();

            vm.image = parameters.Post;

            Radiotherapy.requestImgDicomContent(vm.image.DicomSerNum).then(file => {
                // Parse data and extract info
                file = JSON.parse(file);
                vm.files = file.img; // jpeg encodings
                vm.multiImage = vm.files.length > 1;

                vm.modality = modalityMapping[file.modality];
                vm.date = $filter('formatDateDicom')(file.date);

            }).catch(error => {
                console.error(error);
                $timeout(() => {
                    // TODO: error handling
                    // handleRequestError();
                });

            }).finally(() => {
                vm.loading = false;
            });

            // Implementation of the image scrolling feature (for multi-slice)
            // The images switch to the next/previous slice when the finger is held and dragged down/up on the screen
            vm.index = 1 // index of displayed slice

            let element = document.getElementById('imgs');
            let startY = 0; // y-value (vertical) when finger touches the screen
            let currentY = 0; // y-value of current finger position on screen (changes as it is dragging)

            // Listens for finger touch
            element.addEventListener('touchstart', function(e) {
                startY = e.touches[0].clientY;
                e.preventDefault(); // prevent page itself from scrolling
            })

            // Listens for finger movement (dragging) on screen
            element.addEventListener('touchmove', function(e) {
                currentY = e.touches[0].clientY; //update current y value

                // Switches the image when the change in y positions reaches certain value
                if (Math.abs(currentY - startY) > 10) {
                    let change = Math.round((currentY - startY) / 10); // change '10' to modify scroll speed

                    if ((change + vm.index) < 1 ) vm.index = 1; // stay on first slice if keeps scrolling up
                    else if ((change + vm.index) > vm.files.length) vm.index = vm.files.length; // stay on last slice if keeps scrolling down
                    else vm.index = vm.index + change; // change image slice based on rounded 'change' variable

                    $scope.$apply();
                    startY = currentY; // reset starting point to currentY
                }

                e.preventDefault(); // prevent page from scrolling
            })
        }

        // Returns the src value of the current image slice
        function getSrc(index) {
            return 'data:image/jpg;base64,' + vm.files[index];
        }
    }
})();
