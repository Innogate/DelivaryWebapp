
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  constructor(
    private router: Router,
  ) { }
  selectedCard: string = ''; // Initially, no card is selected

  ngOnInit(): void {
   
  }
  gotoBooking(Data: any) {
    if (Data === "booking") {
      this.router.navigate(["/Dashboard/booking"]);
    } else if (Data === "booking-status") {
      this.router.navigate(["/Dashboard/booking-status"]);
    }
  }



  selectCard(card: string) {
    this.selectedCard = card;
    if (card === "booking") {
      this.router.navigate(["/pages/booking"]);
    } else if (card === "booking-status") {
      this.router.navigate(["/pages/booking-status"]);
    } else if (card === "city") {
      this.router.navigate(["/pages/city"]);
    } else if (card === "state"){
      this.router.navigate(["/pages/state"]);
    } else if (card === "user") {
      this.router.navigate(["/pages/user"]);
    }  else if (card === "employee") {
      this.router.navigate(["/pages/employee"]);
    } 
  }
}

