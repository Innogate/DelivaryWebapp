import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GlobalStorageService } from './services/global-storage.service';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    constructor ( private storage: GlobalStorageService){
        this.storage.set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.hbVVVjR08wPKctvNOgbGBm8xE_VRDureVLHgOaHj8iI', true);    
    }
}
