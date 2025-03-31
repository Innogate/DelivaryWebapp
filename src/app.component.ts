import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginService } from './services/login.service';
import { firstValueFrom, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
    constructor (
        private loginService: LoginService,
        private router: Router

    ){}

    async ngOnInit() {
        await firstValueFrom(
            this.loginService.verify().pipe(
                tap(
                    (res) => {},
                    (error) => {
                        this.loginService.logout();
                        this.router.navigate(["/pages/login"]);
                    }
                )
            )
        )
    }
}
