import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'my-policies',
    loadComponent: () => import('../pages/my-policies/my-policies.component').then(m => m.MyPoliciesComponent)
  },
  {
    path: 'policies',
    loadComponent: () => import('../pages/policies/policies.component').then(m => m.PoliciesComponent)
  },
  {
    path: 'news',
    loadComponent: () => import('../pages/news/news.component').then(m => m.NewsComponent)
  },
  {
    path: 'news-list',
    loadComponent: () => import('../pages/news-list/news-list.component').then(m => m.NewsListComponent)
  },
  {
    path: 'mechanical-assistance',
    loadComponent: () => import('../pages/mechanical-assistance/mechanical-assistance.component').then(m => m.MechanicalAssistanceComponent)
  },
  {
    path: 'sinister',
    loadComponent: () => import('../pages/sinister/sinister.component').then(m => m.SinisterComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('../pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('../pages/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
