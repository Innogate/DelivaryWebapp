import { Component } from '@angular/core';
import { BranchService } from '../../../../../services/branch.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss'],
  imports: [CommonModule]
})
export class BranchComponent {
  branchList: any[] = [];

  constructor(private branchService: BranchService) {
    this.fetchBranches();
  }

  fetchBranches() {
    this.branchService.getAllBranches().subscribe(response => {
      if (response.status === 200 && response.body) {
        this.branchList = response.body;
      }
    });
  }

  deleteBranch(branch: any) {
    this.branchService.deleteBranch(branch.id).subscribe(() => {
      this.branchList = this.branchList.filter(b => b.id !== branch.id);
    });
  }

  updateBranch(branch: any) {
    console.log('Update branch', branch);
  }

  addBranch() {
    console.log('Add branch');
  }
}
