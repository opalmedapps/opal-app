var chai = require('chai');
var expect = require('chai').expect;
var utility = require('../utility.js');
var updatePatient = require('../apiPatientUpdate.js');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(require('chai-datetime'));
describe('Testing the sql functionality that grabs info from the tables in the database',function()
{
  var requestObject = {
    UserID:'ac6eaeaa-f725-4b07-bdc0-72faef725985',
    Parameters:"All",
    Timestamp:"1468596592301"
  };
  updatePatient.refresh(requestObject).then(function(data)
  {
    console.log(data);
  });
});



describe('Tests proper encryption for the encryptObject function', function()
{
    var password = '12345';
  
    it('Encrypt string',function()
    { 
      var word = 'Hello world';
      var copyWord = word;
      encryptedWord = utility.encryptObject(word, password);
      decryptedWord =  utility.decryptObject(encryptedWord, password);
      expect(decryptedWord).to.equal(copyWord);
    });
     it('Encrypt date',function()
    { 
      var date = new Date();
      var copyDate = new Date(date);
      var encryptedDate = utility.encryptObject(copyDate, password);
      var decryptedWord =  utility.decryptObject(encryptedDate, password);    
      var decryptedDate = new Date(decryptedWord);  
      expect(decryptedDate).to.equalDate(copyDate);
    });
    it('Encrypt array',function()
    { 
      var array = ['1','2','3','4'];
      var copy =array.slice();
      encryptObject = utility.encryptObject(array, password);
      decryptObject = utility.decryptObject(encryptObject, password);
      expect(decryptObject).to.deep.equal(copy);
    });
    it('Encrypts object', function()
    {
      var object = {
         date: new Date(),
         string:'test',
         number:'3',
         array:['1','12']
      };
      var copy = (JSON.parse(JSON.stringify(object)));
      encryptObject = utility.encryptObject(object, password);
      decryptObject = utility.decryptObject(encryptObject, password);
      expect(decryptObject).to.deep.equal(copy);      
    });
});

describe('Testing the queue class',function(){
  var queue = '';
   beforeEach(function()
   {
     queue = utility.Queue();
   });
   it('Tests the isEmpty function for the queue',function()
   {
     var empty = queue.isEmpty();
     expect(empty).to.equal(true);
   });
   it('Tests function push and pop for queue',function()
   {
     queue.enqueue('david');
     expect(queue.size()).to.equal(1);
     var popped = queue.dequeue();
     expect(queue.size()).to.equal(0);
     expect(popped).to.equal('david');
   });
});

describe('Testing to mysql date string, toMYSQLString function',function()
{
    it('Tests the toMYSQLString() function', function()
    {
       var date = new Date('2014 05 03');
       var stringDate = utility.toMYSQLString(date);
       expect(stringDate).to.equal('2014-05-03 00:00:00');
    });
});

describe('Testing the resolveEmpty response function',function(){
  
  
   it('Describes response when object is empty',function()
   {
      var test2 = {
        '1':[]
      };
      var response = utility.resolveEmptyResponse(test2);
      expect(response).to.deep.equal({Response:'No Results'});
      
   });
   it('Describes response when object is not empty',function()
   {
       var test1 = {
          '1':[1,2,3],
          '2':[]
        };
      var response = utility.resolveEmptyResponse(test1);
      expect(response).to.deep.not.equal({Response:'No Results'});
      
   });
});