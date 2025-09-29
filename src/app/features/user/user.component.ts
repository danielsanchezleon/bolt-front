import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { UserProfileDto, UserService } from '../../shared/services/user.service';
import { DatePipe } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { AlertService } from '../../shared/services/alert.service';
import { TableViewDto } from '../../shared/dto/table/TableViewDto';
import { DialogModule } from 'primeng/dialog';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ChangePasswordDto } from '../../shared/dto/user/ChangePasswordDto';
import { AlertViewDto } from '../../shared/dto/alert/AlertViewDto';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user',
  imports: [PageWrapperComponent, ButtonModule, DatePipe, TabsModule, CommonModule, FormsModule, ReactiveFormsModule, DialogModule, ModalComponent, FloatLabelModule, InputTextModule, PasswordModule, TableModule, PopoverModule, SelectModule, InputNumberModule, ToggleSwitchModule, PaginatorModule, SkeletonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent 
{
  severityOptions: any[] = [
    {value: 'DISASTER', label: 'Disaster'},
    {value: 'CRITICAL', label: 'Critical'},
    {value: 'MAJOR', label: 'Major'},
    {value: 'WARNING', label: 'Warning'}
  ];

  comparationOptions: any[] = [
    {value: 'MORE_THAN', label: 'Mayor que'},
    {value: 'LESS_THAN', label: 'Menor que'},
    {value: 'WITHIN_RANGE', label: 'Dentro del rango'},
    {value: 'OUT_OF_RANGE', label: 'Fuera del rango'}
  ];

  modifyAlertTimeWindowOptions: any[] = [
    {value: "1m", label: '1 minuto'},
    {value: "5m", label: '5 minutos'},
    {value: "10m", label: '10 minutos'},
    {value: "15m", label: '15 minutos'},
    {value: "30m", label: '30 minutos'},
    {value: "1h", label: '1 hora'},
    {value: "2h", label: '2 horas'},
    {value: "3h", label: '3 horas'},
    {value: "6h", label: '6 horas'},
    {value: "12h", label: '12 horas'},
    {value: "24h", label: '24 horas'}
  ];

  periodicityOptions: any[] = [
    {value: "1m", label: '1 minuto'},
    {value: "5m", label: '5 minutos'},
    {value: "10m", label: '10 minutos'},
    {value: "15m", label: '15 minutos'},
    {value: "30m", label: '30 minutos'},
    {value: "1h", label: '1 hora'}
  ];

  userId: number;

  //User profile data
  userProfileDataLoading: boolean = false;
  userProfileDataError: boolean = false;
  userProfileData: UserProfileDto | null = null;

  //Change password modal
  changePasswordModalVisible: boolean = false;

  changePasswordForm: FormGroup;

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmNewPassword: boolean = false;

  errorMessage: string | null = null;

  //User alert list
  isLoadingUserAlertList: boolean = false;
  isErrorUserAlertList: boolean = false;
  userAlertsPage: any;
  userAlertList: AlertViewDto[] = [];
  userAlertListFirst: number = 0;
  userAlertListPage: number = 0;
  userAlertListSize: number = 5;

  //User alert list
  isLoadingTeamAlertList: boolean = false;
  isErrorTeamAlertList: boolean = false;
  teamAlertsPage: any;
  teamAlertList: AlertViewDto[] = [];
  teamAlertListFirst: number = 0;
  teamAlertListPage: number = 0;
  teamAlertListSize: number = 5;

  constructor(private route: ActivatedRoute, 
              private router: Router, 
              private userService: UserService, 
              public authService: AuthService, 
              private alertService: AlertService,
              private _fb: FormBuilder) 
  {
    this.route.snapshot.paramMap.has('user_id') ? this.userId = this.route.snapshot.params['user_id'] : this.userId = 0;

    this.changePasswordForm = this._fb.group({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]),
      confirmNewPassword: new FormControl('', [Validators.required]),
    },
    { validators: [this.matchPasswordsValidator()] });
  }

  private matchPasswordsValidator() {
    return (group: FormGroup) => {
      const pass = group.get('newPassword')?.value;
      const confirm = group.get('confirmNewPassword')?.value;
      return pass && confirm && pass === confirm ? null : { mismatch: true };
    };
  }

  ngOnInit()
  {
    this.getUserProfileData();
    this.getUserAlertList(this.userAlertListPage, this.userAlertListSize, null);
    this.getTeamAlertList(this.teamAlertListPage, this.teamAlertListSize, null);
  }

  onClickNavigateToHome() 
  {
    this.router.navigate(['']);
  }

  onClickCloseChangePasswordModal()
  {
    this.changePasswordModalVisible = false;
    this.changePasswordForm.reset();
    this.errorMessage = null;
  }

  onClickConfirmChangePassword()
  {
    this.userService.changePassword(new ChangePasswordDto(this.userId, this.changePasswordForm.get('oldPassword')?.value, this.changePasswordForm.get('newPassword')?.value, this.changePasswordForm.get('confirmNewPassword')?.value)).subscribe(
      (response) => {
        this.onClickCloseChangePasswordModal();
      },
      (error) => {
        this.errorMessage = error?.error;
      }
    )
  }

  getUserProfileData()
  {
    this.userProfileDataLoading = true;
    this.userProfileDataError = false;

    this.userService.getUserProfileData(this.userId).subscribe(
      (response) => {
        this.userProfileDataLoading = false;
        this.userProfileDataError = false;
        this.userProfileData = response;
      },
      (error) => {
        this.userProfileDataLoading = false;
        this.userProfileDataError = true;
      }
    )
  }

  getUserAlertList(page: number, size: number, filterText: string | null)
  {
    this.isLoadingUserAlertList = true;
    this.isErrorUserAlertList = false;

    this.alertService.getUserAlertList(page, size, filterText).subscribe(
      (response) => {
        this.isLoadingUserAlertList = false;
        this.isErrorUserAlertList = false;
        this.userAlertsPage = response;
        this.userAlertList = response.content;
      },
      (error) => {
        this.isLoadingUserAlertList = false;
        this.isErrorUserAlertList = true;
      }
    )
  }

  onUserAlertsPageChange(event: any)
  {
    this.userAlertListFirst = event.first;
    this.userAlertListPage = event.page;
    this.userAlertListSize = event.rows;

    this.getUserAlertList(this.userAlertListPage, this.userAlertListSize, null);
  }

  getTeamAlertList(page: number, size: number, filterText: string | null)
  {
    this.isLoadingTeamAlertList = true;
    this.isErrorTeamAlertList = false;

    this.alertService.getTeamAlertList(page, size, filterText).subscribe(
      (response) => {
        this.isLoadingTeamAlertList = false;
        this.isErrorTeamAlertList = false;
        this.teamAlertsPage = response;
        this.teamAlertList = response.content;
      },
      (error) => {
        this.isLoadingTeamAlertList = false;
        this.isErrorTeamAlertList = true;
      }
    )
  }

  onTeamAlertsPageChange(event: any)
  {
    this.teamAlertListFirst = event.first;
    this.teamAlertListPage = event.page;
    this.teamAlertListSize = event.rows;

    this.getTeamAlertList(this.teamAlertListPage, this.teamAlertListSize, null);
  }

  onClickGoToEditAlert(alert: AlertViewDto)
  {
    this.router.navigate(['alert', alert.alertType, 'edit', alert.alertId]);
  }
}
