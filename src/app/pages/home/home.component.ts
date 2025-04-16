import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(
    private router:Router
  ){

  }

  NavigateMethod(){
      this.router.navigate(['/pages/tracking'])
  }

}
