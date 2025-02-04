import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  username: string | null = null;
  menuClicked: boolean=false;

  constructor(public router:Router,private userService: UserService) {
    // Retrieve user data from local storage
    this.userService.currentUser.subscribe((data)=>{
      this.username=data
    })
  }
  ngOnInit() {
    this.userService.currentUser.subscribe(username => {
      this.username = username; // Update username when it changes
    });
  }

  logout() {
    //localStorage.removeItem('user');
   this.userService.logOutUser(); // Clear the username
  }
  menu(){
    this.menuClicked=!this.menuClicked
  }
}
