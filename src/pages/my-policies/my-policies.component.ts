import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../services/policy';
import { Section } from '../../models/section.model';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './my-policies.component.html'
})
export class MyPoliciesComponent implements OnInit, OnDestroy {
  segment = 'online';
  policySections: Section[] = [];
  private onDownloadedBound = this.onDownloaded.bind(this);

  constructor(private policyService: PolicyService, private navCtrl: NavController) {}

  ngOnInit() {
    // PolicyService uses EventTarget in migration; listen to it
    try { this.policyService.policiesDownloadedChanged.addEventListener('changed', this.onDownloadedBound); } catch {}
    this.init();
  }

  ngOnDestroy() {
    try { this.policyService.policiesDownloadedChanged.removeEventListener('changed', this.onDownloadedBound); } catch {}
  }

  private onDownloaded() {
    if (this.segment === 'downloaded') this.onLoadPoliciesDownloaded();
  }

  segmentChanged() {
    if (this.segment === 'online') this.onLoadPoliciesOnline();
    else this.onLoadPoliciesDownloaded();
  }

  goToPolicies(selectedSection: Section) {
    // passing data via navigation state; adjust receiver in Policies page
    this.navCtrl.navigateForward('/policies', { state: { policies: selectedSection.policies } });
  }

  onLoadPoliciesOnline() {
    this.policyService.getWithSections('online').subscribe({
      next: (sections) => this.policySections = sections,
      error: (e) => console.log(e)
    });
  }

  onLoadPoliciesDownloaded() {
    this.policyService.getWithSections('downloaded').subscribe({
      next: (sections) => this.policySections = sections,
      error: (e) => console.log(e)
    });
  }

  init() {
    this.policyService.storePolicies().subscribe({
      next: () => this.onLoadPoliciesOnline(),
      error: () => this.onLoadPoliciesOnline()
    });
  }
}