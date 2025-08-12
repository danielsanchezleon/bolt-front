import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { EndpointService } from '../../shared/services/endpoint.service';
import { EndpointDto } from '../../shared/dto/endpoint/EndpointDto';

@Component({
  selector: 'app-create-endpoint',
  imports: [PageWrapperComponent, ButtonModule, FloatLabelModule, InputTextModule, ReactiveFormsModule, SelectModule, ModalComponent, FormsModule, CommonModule],
  templateUrl: './create-endpoint.component.html',
  styleUrl: './create-endpoint.component.scss'
})
export class CreateEndpointComponent 
{
  endpointTypes: any[] = [{value: 'email', label: 'Email'}, {value: 'teams', label: 'Teams'}, {value: 'webhook', label: 'Webhook'}, {value: 'pagerduty', label: 'PagerDuty'}];

  endpointForm: FormGroup;

  modalVisible: boolean = false;

  isLoading: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;

  constructor (private router: Router, private _fb: FormBuilder, private endpointService: EndpointService) 
  {
    this.endpointForm = this._fb.group({
      type: ['', [Validators.required]],
      destination: ['', [Validators.required]],
      name: ['', [Validators.required]]
    });
  }

  onClickNavigateToEndpoints()
  {
    this.router.navigate(['endpoints']);
  }

  onClickConfirmCreateEndpoint()
  {
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;

    this.endpointService.createEndpoint(new EndpointDto(this.endpointForm.get('name')?.value, this.endpointForm.get('destination')?.value, this.endpointForm.get('type')?.value)).subscribe(
      (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.isError = false;
      },
      (error) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.isError = true;
      }
    );
  }
}
