import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, FormControl } from '@angular/forms';
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
  endpointTypes: any[] = [{value: 'email', label: 'Email'}, {value: 'pagerduty', label: 'Pagerduty'}];

  //Forms
  endpointForm: FormGroup;
  addressControl: FormControl;
  emailOptionalSettingsForm: FormGroup;
  integrationKeyControl: FormControl;

  addresses: string[] = [];

  modalVisible: boolean = false;

  isLoading: boolean = false;
  isSuccess: boolean = false;
  isError: boolean = false;

  constructor (private router: Router, private _fb: FormBuilder, private endpointService: EndpointService) 
  {
    this.endpointForm = this._fb.group({
      type: ['', [Validators.required]],
      name: ['', [Validators.required]]
    });

    this.addressControl = new FormControl('', [Validators.required]);

    this.emailOptionalSettingsForm = this._fb.group({
      message: [''],
      subject: ['']
    });

    this.integrationKeyControl = new FormControl('', [Validators.required]);
  }

  onClickNavigateToEndpoints()
  {
    this.router.navigate(['endpoints']);
  }

  getEmailData(): Record<string, any>
  {
    let emailData: Record<string, any> = { addresses: this.addresses.join(';') };
    
    if (this.emailOptionalSettingsForm.get('message')?.value)
    {
      emailData['message'] = this.emailOptionalSettingsForm.get('message')?.value;
    }
    
    if (this.emailOptionalSettingsForm.get('subject')?.value)
    {
      emailData['subject'] = this.emailOptionalSettingsForm.get('subject')?.value;
    }

    return emailData;
  }

  getPagerdutyData(): Record<string, any>
  {
    return { integrationKey: this.integrationKeyControl.value };
  }

  onClickConfirmCreateEndpoint()
  {
    this.isLoading = true;
    this.isSuccess = false;
    this.isError = false;

    let endpointData: EndpointDto = new EndpointDto();

    if (this.endpointForm.get('type')?.value?.value == 'email') 
    {
      endpointData = new EndpointDto(this.endpointForm.get('type')?.value?.value, this.getEmailData(), this.endpointForm.get('name')?.value);
    } 
    else if (this.endpointForm.get('type')?.value?.value == 'pagerduty') 
    {
      endpointData = new EndpointDto(this.endpointForm.get('type')?.value?.value, this.getPagerdutyData(), this.endpointForm.get('name')?.value);
    }

    this.endpointService.createEndpoint(endpointData).subscribe(
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

  onClickAddAddress()
  {
    let value = this.addressControl.value;

    if (value.includes(';')) 
    {
      value.split(';').map( (addr: string) => addr.trim()).filter((addr: string) => addr.length > 0).forEach((addr: string) => this.addresses.push(addr));
    }
    else
    {
      this.addresses.push(value.trim());
    }

    this.addressControl.reset();
  }

  onClickRemoveAddress(index: number)
  {
    this.addresses.splice(index, 1);
  }

  onChangeEndpointTypeSelection()
  {
    this.endpointForm.get('name')?.reset();
    this.addressControl.reset();
    this.addresses = []
    this.emailOptionalSettingsForm.reset();
  }
}
