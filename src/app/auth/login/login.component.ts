import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConstantDef } from '~/app/core/constantDef';
import { Service } from '~/app/core/services/services.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../auth.service';
import { LoadingService } from '~/app/core/services/loading.service';
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  isChangePos: boolean = false;
  visible: boolean = false;
  constructor(
    private services: Service,
    private formBuilder: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private authService: AuthService,
    private loading: LoadingService
  ) {
    this.loginForm = formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      checkRemember: [false],
    });
  }

  ngOnInit() {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      const a = this.authService.isTokenExpired(accessToken);
    }

    if (accessToken && !this.authService.isTokenExpired(accessToken)) {
      this.services.getUserData(accessToken).subscribe(
        (data: any) => {
          if (data.status == ConstantDef.STATUS_SUCCES) {
            const username = data.response.username;
            this.loginForm.patchValue({
              username: username,
              checkRemember: true,
            });
          }
        },
        (error: any) => {
          this.messageService.add({
            severity: 'error',
            detail: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          });
        }
      );
    } else {
    }
  }

  login() {
    if (this.loginForm.valid) {
      const data = {
        username: this.loginForm.value?.username.trim(),
        password: this.loginForm.value?.password.trim(),
      };

      this.loading.show();
      this.services.login(data).subscribe(
        (data: any) => {
          if (data.status == ConstantDef.STATUS_SUCCES) {
            if (this.loginForm.value.checkRemember) {
              const access = data.response?.access;
              const refresh = data.response?.refresh;
              this.authService.setTokens(access, refresh);
            } else {
              localStorage.removeItem('token');
            }
            this.router.navigate(['/home']);
            this.loading.hide();
          } else {
            this.loading.hide();
            this.visible = true;
          }
        },
        (error: any) => {
          console.log(error);
          this.loading.hide();
        }
      );
    } else {
      if (!this.loginForm.controls['username'].valid) {
      }
      if (!this.loginForm.controls['password'].valid) {
        this.messageService.add({
          severity: 'error',
          detail: 'password không hợp lệ',
        });
      }
      if (!this.loginForm.controls['username'].valid) {
        this.messageService.add({
          severity: 'error',
          detail: 'username không hợp lệ',
        });
      }
    }
  }
  inputValue(event: any) {
    if (event.value == '') {
      $(`#${event.id}`).addClass('invalid');
    } else {
      $(`#${event.id}`).removeClass('invalid');
    }
  }
}
