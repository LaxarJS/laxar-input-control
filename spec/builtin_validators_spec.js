/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../ax-input-control',
   './builtin_validators_spec_data',
   'jquery',
   'angular',
   'angular-mocks'
], function( inputModule, data, $, ng ) {
   'use strict';

   describe( 'builtin validators', function() {

      var $compile;
      var $rootScope;
      var $input;
      var scope;
      var ngModel;

      beforeEach( ng.mock.module( inputModule.name ) );
      beforeEach( ng.mock.inject( function( _$compile_, _$rootScope_ ) {
         $compile = function( source ) {
            var compiled = _$compile_( source );
            return function( scope ) {
               // Ensure that the returned element wrapper includes the complete jQuery api. This makes the
               // configuration of jQuery as AngularJS dependency redundant.
               var element = compiled( scope );
               var $element = $( element );
               // We just have to re-attach the angular-specific controller method to the jQuery object again
               $element.controller = element.controller;
               return $element;
            };
         };
         $rootScope = _$rootScope_;

         $rootScope.i18n = {
            locale: 'default',
            tags: {
               'default': 'de_DE'
            }
         };
         scope = $rootScope.$new();
      } ) );

      beforeEach( function() {
         $.fn.tooltip = jasmine.createSpy( 'tooltip' ).and.returnValue( {
            on: function() { return this; }
         } );

         jasmine.clock().install();
      } );

      afterEach( function() {
         jasmine.clock().uninstall();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      data.simpleTests.forEach( function( testGroup ) {

         describe( 'for type ' + testGroup.type, function() {

            testGroup.tests.forEach( function( test ) {

               describe( 'a ' + test.constraint + ' validator' , function() {

                  beforeEach( function() {
                     var html = '<input ' +
                        'ax-input="' + testGroup.type + '" ' +
                        'ng-model="modelValue" ' +
                        'ax-input-' + test.constraint + '="' + test.constraintValue + '">';
                     $input = $compile( html )( scope );

                     ngModel = $input.controller( 'ngModel' );

                     scope.$apply( function() {
                        scope.modelValue = testGroup.initialValue;
                     } );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'accepts the valid input ' + testGroup.validInput, function() {
                     enter( $input, testGroup.validInput );

                     expect( ngModel.$error.semantic ).toBeUndefined();
                     expect( scope.modelValue ).toEqual( testGroup.validExpected );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  test.inputs.forEach( function( input, index ) {

                     it( 'sets a semantic error for invalid input "' + input + '", but updates the model', function() {
                        enter( $input, input );

                        expect( ngModel.$error.semantic ).toBe( true );
                        expect( scope.modelValue ).toEqual( test.expected[ index ] );
                     } );

                  } );

               } );

            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'for bound constraint values', function() {

         data.boundConstraintsTests.forEach( function( testGroup ) {

            describe( 'for constraint ' + testGroup.constraint, function() {

               beforeEach( function() {
                  var html = '<input ng-model="modelValue" ' +
                     'ax-input="' + testGroup.valueType + '" ' +
                     'ax-input-' + testGroup.constraint + '="constraintBinding">';

                  scope.constraintBinding = testGroup.initialConstraintValue;
                  scope.modelValue = testGroup.initialValue;

                  $input = $compile( html )( scope );

                  scope.$digest();

                  ngModel = $input.controller( 'ngModel' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'reads its initial constraint value for validation', function() {
                  enter( $input, testGroup.invalidValue );
                  expect( ngModel.$error.semantic ).toBe( true );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               describe( 'when the constraint value is changed', function() {

                  beforeEach( function() {
                     enter( $input, testGroup.resetValue );// trigger a value change
                     scope.$apply( function() {
                        scope.constraintBinding = testGroup.secondConstraintValue;
                     } );
                  } );

                  ////////////////////////////////////////////////////////////////////////////////////////////

                  it( 'applies its new value on validation (jira ATP-8140)', function() {
                     enter( $input, testGroup.invalidValue );
                     expect( ngModel.$error.semantic ).toBeUndefined(
                        'Constraint: ' + testGroup.constraint +
                           ', Value: ' + testGroup.invalidValue +
                           ', new constraint value: ' + testGroup.secondConstraintValue
                     );
                  } );

               } );

            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function enter( $input, value ) {
      ng.element( $input ).controller( 'ngModel' ).$setViewValue( value );
      // $input.val( value );
      // $( $input ).trigger( 'change' );
   }

} );
