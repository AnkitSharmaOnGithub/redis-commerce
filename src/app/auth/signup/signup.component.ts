import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  myForm: FormGroup;
  signup_result = null;
  loading: boolean = false;
  signup_error = null;

  constructor(private fb: FormBuilder, private http: HttpClient, private ngxLoader: NgxUiLoaderService) {
  }

  ngOnInit(): void {
    this.myForm = new FormGroup({});
    this.myForm.addControl('email', new FormControl('', [Validators.required]));
    this.myForm.addControl('password', new FormControl('', [Validators.required, Validators.minLength(8)]));
    this.myForm.addControl('confirmPassword', new FormControl(
      '', [Validators.compose(
        [Validators.required, Validators.minLength(8), this.validateAreEqual.bind(this)]
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
      

      // Make a call to the create user API.
      const { email, password, confirmPassword } = form.value;

      if (email && password && confirmPassword) {
        const api_url = environment.BACKEND_DOMAIN + '/user/create';
        this.http.post(api_url, {
          email, password, confirmPassword
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).subscribe(data => {
          this.loading = true;
          this.signup_result = data;
        },
          error => {
            this.loading = false;
            if(error && error.message){
              this.signup_error = error.message;
            }
            console.log(error);
          });
      }
      // Redirect the user to the login route.
    }
  }

}
