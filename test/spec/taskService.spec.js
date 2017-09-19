describe("A spec to test taskService", function() {

    var Tasks, httpBackend;

    beforeEach(module('MUHCApp'));
    beforeEach(function () {

        spyOn(ons, 'isWebView').and.returnValue(true);

        inject(function($injector) {
            Tasks = $injector.get('Tasks');
        });

    });

    it('should contain a taskService', function() {
            expect(Tasks).not.toBe(null);
    });

    it('should ')


});