

import { DebugElement } from '@angular/core';
import { async, ComponentFixture,
    fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { FormsModule } from '@angular/forms';

import { Contact, ContactService, FavoriteIconDirective,
    InvalidPhoneNumberModalComponent,
    InvalidEmailModalComponent } from '../shared';
import { AppMaterialModule } from '../../app.material.module';
import { ContactEditComponent } from './contact-edit.component';
import '../../../material-app-theme.scss';

// to initialize and set-up your environment for unit tests.

// creates the test suite that contains all our tests
describe('Chapter 3: Testing components -ContactEditComponent tests', () => {
    // an instance of the ComponentFixture,
    // which contains methods that help us debug and test a component
    let fixture: ComponentFixture<ContactEditComponent>;

    // an instance of the ContactEditComponent
    let component: ContactEditComponent;

    /*
    A test fake is an object used in a test that substitutes for the real thing.
    A mock is a fake that simulates the real object and keeps track of when it’s called and what arguments it receives.
    A stub is a simple fake with no logic, that always returns the same value.


    here we use a fake instance of ContactService
    because the real ContactService makes HTTPcalls,
    which would make our tests harder to run and less deterministic.
    Also, faking the ContactService allows us to focus 
    on testing the ContactEditComponent,
    without worryingabout how ContactService works

    The fake ContactService has the same type as the real one
    */
    let contactService: ContactService;

    // stores the DebugElement for our component, which is how we’ll access its children
    let rootElement: DebugElement;

    // create our fake service named contactServiceStub
    const contactServiceStub = {
        contact: {
            id: 1,
            name: 'janet'
        },
        save: async function (contact: Contact) {
            component.contact = contact;
        },
        getContact: async function () {
            component.contact = this.contact;
            return this.contact;
        },
    };
    
    // sets up our TestBed configuration
    beforeEach(() => {
        // Configuring TestBed to be used in our tests.
        TestBed.configureTestingModule({
            declarations: [
                ContactEditComponent,
                FavoriteIconDirective,
                InvalidEmailModalComponent,
                InvalidPhoneNumberModalComponent
            ],
            imports: [
                AppMaterialModule,
                FormsModule,
                NoopAnimationsModule,
                RouterTestingModule
            ],
            // use the contactServiceStub instead of the real service
            providers: [{provide: ContactService, useValue: contactServiceStub}]
        });
        
        // have to use overrideModule because there are a couple of components that will be lazy loaded
        TestBed.overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [InvalidEmailModalComponent, InvalidPhoneNumberModalComponent]
            }
        });
        
        // Getting an instance of the contactService that uses the contactServiceStub
        contactService = TestBed.get(ContactService);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContactEditComponent);
        component = fixture.componentInstance;

        // the updates to your component will be rendered in the DOM
        fixture.detectChanges();
        rootElement = fixture.debugElement;
    });

    /*
    In general, you shouldn’t test private methods;
    if a method is important enough to be tested,
    you should consider making it public
    */
    describe('saveContact() test', () => {
        it('should display contact name after contact set', fakeAsync(() => {
            // The contact object that we will save
            const contact = {
                id: 1,
                name: 'lorace'
            };

            // Set the isLoading to false to hide the progress bar.
            component.isLoading = false;

            // Save the contact object
            component.saveContact(contact);

            // Use the detectChanges method to trigger change detection
            fixture.detectChanges();

            // Get the nameInput form field
            const nameInput = rootElement.query(By.css('.contact-name'));

            // Simulate the passage of time using tick
            tick();

            // The assertion checks to see if the name property has been set correctly
            expect(nameInput.nativeElement.value).toBe('lorace');
        }));
    });

    describe('loadContact() test', () => {
        it('should load contact', fakeAsync(() => {
            component.isLoading = false;

            // Executes the loadContact method
            component.loadContact();
            fixture.detectChanges();
            const nameInput = rootElement.query(By.css('.contact-name'));
            tick();

            // The default contact that is loaded has a value of “janet” for the name property.
            // We expect the name field to have the contact’s name which is “janet”.
            expect(nameInput.nativeElement.value).toBe('janet');
        }));
    });

    describe('updateContact() tests', () => {
        it('should update the contact', fakeAsync(() => {
            const newContact = {
                id: 1,
                name: 'london',
                email: 'london@example.com',
                number: '1234567890'
            };
            component.contact = {
                id: 2,
                name: 'chauncey',
                email: 'chauncey@example.com',
                number: '1234567890'
            };
            component.isLoading = false;
            fixture.detectChanges();
            const nameInput = rootElement.query(By.css('.contact-name'));
            tick();
            expect(nameInput.nativeElement.value).toBe('chauncey');

            // Updates the existing contact to the newContact object
            component.updateContact(newContact);

            // We use the detectChanges method to trigger change detection.
            fixture.detectChanges();

            // The tick method simulates the passage of time. In this case we simulate the passage of 100 milliseconds.
            tick(100);

            // In the assertion we are checking to see that the value in name input form field has been changed correctly.
            expect(nameInput.nativeElement.value).toBe('london');
        }));

        it('should not update the contact if email is invalid', fakeAsync(() => {
            const newContact = {
                id: 1,
                name: 'london',
                email: 'london@example', // Email is invalid
                number: '1234567890'
            };
            component.contact = {
                id: 2,
                name: 'chauncey',
                email: 'chauncey@example.com',
                number: '1234567890'
            };
            component.isLoading = false;
            fixture.detectChanges();
            let nameInput = rootElement.query(By.css('.contact-name'));
            tick();
            expect(nameInput.nativeElement.value).toBe('chauncey');
            component.updateContact(newContact);
            fixture.detectChanges();
            tick(100);

            // Since the email is invalid the contact should not be updated using the newContact object,
            // therefore the contact name should be the same.
            expect(nameInput.nativeElement.value).toBe('chauncey');
        }));

        it('should not update the contact if phone number is invalid', fakeAsync(() => {
            const newContact = {
                id: 1,
                name: 'london',
                email: 'london@example.com',
                number: '12345678901' // Number is invalid
            };
            component.contact = {
                id: 2,
                name: 'chauncey',
                email: 'chauncey@example.com',
                number: '1234567890'
            };
            component.isLoading = false;
            fixture.detectChanges();
            let nameInput = rootElement.query(By.css('.contact-name'));
            tick();
            expect(nameInput.nativeElement.value).toBe('chauncey');
            component.updateContact(newContact);
            fixture.detectChanges();
            tick(100);

            // Since the number is invalid the contact should not be updated using the newContact object,
            // therefore the contact name should be the same.
            expect(nameInput.nativeElement.value).toBe('chauncey'); 
        }));
    });
});

