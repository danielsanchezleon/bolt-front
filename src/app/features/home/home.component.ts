import { Component } from '@angular/core';
import { PageWrapperComponent } from '../../shared/components/page-wrapper/page-wrapper.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../shared/services/alert.service';
import { HomePanelsViewDto } from '../../shared/dto/home/HomePanelsViewDto';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-home',
  imports: [PageWrapperComponent, CommonModule, FormsModule, SelectButtonModule, TableModule, SkeletonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  alerts: any[] = [];

  isLoading: boolean = false;
  isError: boolean = false;
  homePanels?: HomePanelsViewDto;;

  constructor(private router: Router, private alertService: AlertService) {}

  ngOnInit() 
  {
    this.getHomePanels();
  }

  getHomePanels()
  {
    this.isLoading = true;
    this.isError = false;

    this.alertService.getHomePanels().subscribe(
      (response) => {
        this.isLoading = false;
        this.homePanels = response;
      },
      (error) => {
        this.isLoading = false;
        this.isError = true;
      }
    )
  }

  onClickNavigateToCreateAlert()
  {
    this.router.navigate(['alert/create']);
  }

  onClickNavigateToModifyAlert()
  {
    this.router.navigate(['alerts']);
  }
}
