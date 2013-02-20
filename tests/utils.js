var assert = require('assert')
  , global = require('../global')
  , freebase = global.freebase
  , utils = require('../utils')

describe('generateFreebaseURL', function(){

    describe('images', function(){
        it('generated URL should match the provided URL', function(){
            var parameters = { maxheight: 300, maxwidth: 300, mode: 'fillcropmid', key: freebase.key }
            var path = utils.generateFreebaseURL(freebase.images, '123456', parameters);
            assert.equal('https://usercontent.googleapis.com/freebase/v1/image/123456?maxheight=300&maxwidth=300&mode=fillcropmid&key=AIzaSyDWnuOnTsNHDcyCTgk0FOksN0OmPpak6og', path);
        })

        it('generated URL should match the provided URL', function(){
            var path = utils.generateFreebaseURL(freebase.images, '123456');
            assert.equal('https://usercontent.googleapis.com/freebase/v1/image/123456', path);
        })

    })

    describe('articles', function(){
        it('generated URL should match the provided URL', function(){
            var parameters = { maxlength: 800, key: freebase.key }
            var path = utils.generateFreebaseURL(freebase.articlesPath, '/m/lol', parameters);
            assert.equal('/api/trans/blurb//m/lol?maxlength=800&key=AIzaSyDWnuOnTsNHDcyCTgk0FOksN0OmPpak6og', path);
        })

        it('generated URL should match the provided URL', function(){
            var path = utils.generateFreebaseURL(freebase.articlesPath, '/m/lol123');
            assert.equal('/api/trans/blurb//m/lol123', path);
        })

    })


})
