import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { interval, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  myForm: FormGroup;
  signup_result = null;
  signup_error = null;

  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient, private ngxLoader: NgxUiLoaderService) {
  }

  ngOnInit(): void {
    this.myForm = new FormGroup({});
    this.myForm.addControl('email', new FormControl('', [Validators.required]));
    this.myForm.addControl('password', new FormControl('', [Validators.required, Validators.minLength(4)]));
    this.myForm.addControl('confirmPassword', new FormControl(
      '', [Validators.compose(
        [Validators.required, Validators.minLength(4), this.validateAreEqual.bind(this)]
      )]
    ));
  }

  private validateAreEqual(fieldControl: FormControl) {
    return fieldControl.value === this.myForm.get("password").value ? null : {
      NotEqual: true
    };
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {

      // Start the ngX Loader
      this.ngxLoader.start();

      // Make a call to the create user API.
      const { email, password, confirmPassword } = form.value;

      if (email && password && confirmPassword) {
        const api_url = environment.BACKEND_DOMAIN + '/user/create';
        this.http.post<{ status: string }>(api_url, {
          email, password, confirmPassword
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).subscribe(data => {
          this.signup_result = data.status;
          // Redirect the user to the login route.
          // Stop the ngX Loader
          this.ngxLoader.stop();
          interval(1000).pipe(take(10))
            .subscribe(data => {
              this.signup_result = null;
              this.signup_error = null;
              this.router.navigate(['/login']);
            });
        },
          error => {
            if (error?.error?.error) {
              this.signup_error = error.error.error;
            }

            // Stop the ngX Loader
            this.ngxLoader.stop();
            interval(1000).pipe(take(10))
              .subscribe(data => {
                this.signup_result = null;
                this.signup_error = null;
              });
          });
      }

      // Perform the clean up
    }
  }

}
