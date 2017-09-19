describe('Documents Service for Opal',function()
{ 
  var Documents;
  var docs = [];
  var documentsToAdd = [];
  var documentToUpdate = [];

   beforeEach(function (){
    
    // load the module.
   module('MUHCApp');
   var spy = spyOn(ons, 'isWebView').and.callFake(function(){
       return true;
   });
    // inject your service for testing.
    // The _underscores_ are a convenience thing
    // so you can have your variable name be the
    // same as your injected service.
    inject(function(_Documents_,_UserAuthorizationInfo_) {
      Documents = _Documents_;
      UserAuthorizationInfo = _UserAuthorizationInfo_;
      UserAuthorizationInfo.setPassword('1234');
    });
    documentsToAdd = [{DocumentType:'pdf', Content:'adas',DateAdded:'2015-05-20 00:00:00', DocumentSerNum:'2'},{DocumentType:'pdf', Content:'ada',DateAdded:'2015-05-20 00:00:00', DocumentSerNum:'1'}];
    documentToUpdate = [{DocumentType:'pdf', Content:'david',DateAdded:'2015-05-20 00:00:00', DocumentSerNum:'1'}];
    Documents.setDocuments(documentsToAdd);
    docs = Documents.getDocuments();
  });
  it('it should handle empty set of documents well',function()
  {
    Documents.setDocuments(undefined);
    var documents = Documents.getDocuments();
    
    expect(documents.length).toEqual(0);
    Documents.updateDocuments(undefined);
    console.log(documents,'1231');
    documents = Documents.getDocuments();
    expect(documents.length).toEqual(0);
  });
   it('It should update the documents correctly to object',function()
  {
    Documents.updateDocuments(documentToUpdate);
    var docs2 = Documents.getDocuments();
    expect(docs2.length).toEqual(2);
    expect(docs2[1].Content).toEqual('data:application/pdf;base64,david');
    expect(docs[0].DocumentType).toEqual('pdf');
    var newDocument = [{DocumentType:'pdf', Content:'adas3',DateAdded:'2015-05-20 00:00:00', DocumentSerNum:'3'}];
    Documents.updateDocuments(newDocument);
    doc2 = Documents.getDocuments();
    expect(docs2.length).toEqual(3);
    expect(docs2[2].DocumentSerNum).toEqual('3');
  });
});
describe('CheckinService', function() {
  beforeEach(module('MUHCApp'));
  var spy;
  beforeEach(function() {
    var spy = spyOn(ons, 'isWebView').and.callFake(function(){
      return true;
  });
  });
  var $controller;

  beforeEach(inject(function($rootScope, _CheckinService_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    CheckinService = _CheckinService_;
    rootScope = $rootScope;
  }));

  describe('$scope.login', function() {
    it('sets the strength to "strong" if the password length is >8 chars', function() {
      var $scope = {}; 
      // var controller = $controller('LoginController', { $scope: $scope });
      // $scope.submit('muhc.app.mobile@gmail.com','12345');
      
      // expect($scope.email).toEqual('muhc.app.mobile@gmail.com');
    });
  });
});