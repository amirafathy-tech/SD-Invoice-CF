import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthUser } from '../auth-user.model';
//import { AlertService } from 'src/app/shared/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  //providers:[AlertService]
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required,
    Validators.email]),
    password: new FormControl('', [Validators.required
      //Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/) 
    ])
  });

  // to control eye of password
  isShown: boolean = true;


  loading = false;
  submitted = false;
  error!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    // private alertService: AlertService
  ) { }

  ngOnInit() {
  }

  onSubmit(userData: FormGroup) {
    console.log(userData);
    console.log(userData.value.username);
    
    // this.submitted = true;
   
    this.loading = true;
    this.authService.signIn(userData.value.username,userData.value.password)
      // .pipe(first())
      .subscribe({
        next: (res) => {
          console.log(res);
          const user = new AuthUser(userData.value.username, res.id_token);
          localStorage.setItem('token', res.id_token);
          this.authService.loggedInUser.next(user);
          //this.loading = false;
          this.router.navigate(['/service-invoice-data']);
        },
        error: (error) => {
          console.log(error);
          alert(error)
          this.loading = false;
        },
        complete: () => {
        }
      });
  }
}
