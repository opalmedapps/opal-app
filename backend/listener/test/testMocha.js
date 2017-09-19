// var chai = require('chai');
// var expect = require('chai').expect;
// var utility = require('../utility/utility.js');
// var sinon = require('sinon');
// var sinonChai = require('sinon-chai');
// var sqlInterface = require('../api/sqlInterface.js');   
// chai.use(sinonChai);

// describe('Sanitize',function(){
//     beforeEach(function(){
//        console.log('before each'); 
//     });
//     afterEach(function(){
//        console.log('after each'); 
//     });
//    it("returns the lower case of a string",function(){
//        var inputWord = "HELLO WORLD";
//        outputWord = utility.sanitize(inputWord);
//        expect(outputWord).to.equal("hello world");
//    });
// });

// describe('Tokenize',function()
// {
//    it('returns an array of text',function(){
//        var sentence = 'hello world';
//        var tokenize = utility.tokenize(sentence);
//        expect(tokenize).to.include.members(['hello', 'world']); 
//    });
// });
// describe('Github Info',function()
// {
//     it.skip('Fetches information from Github',function(done){
//        utility.info(function(reply){
//            expect(reply[0].id).to.equal('3916574713');
//            done(); 
//        });
         
//     });
    
// });
// describe('Info Language',function(){
//     it('returns language info',function(done){
//        var ghPage = {
//            'Language':'Assembly'
//        };
//        var stub = sinon.stub().callsArgWith(0,ghPage);
//        utility.infoLang(stub,function(reply)
//        {
//            expect(reply).to.equal('Language is Assembly');
//            done(); 
//        });
//     });
// });
// describe('Testing the eductional material section',function()
// {
//    var rows = {
       
//    };
// });