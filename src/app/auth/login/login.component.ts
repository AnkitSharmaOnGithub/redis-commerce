import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { interval, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  myForm: FormGroup;
  signup_result = null;
  signup_error = null;

  constructor(private fb: FormBuilder, private ngxLoader: NgxUiLoaderService, private http:HttpClient, private router:Router) {
  }

  ngOnInit(): void {
    this.myForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50), Validators.minLength(8)]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    });
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
