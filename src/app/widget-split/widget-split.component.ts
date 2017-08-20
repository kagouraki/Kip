import { Component, OnInit, Input } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { TreeNode, TreeManagerService } from '../tree-manager.service';

export class WidgetSplitConfig {
  orientation: string // row or col
  children: WidgetSplitChildren[]
}

export class WidgetSplitChildren {
  uuid: string
  order: number
  ratio: number
}


@Component({
  selector: 'app-widget-split',
  templateUrl: './widget-split.component.html',
  styleUrls: ['./widget-split.component.css']
})

export class WidgetSplitComponent implements OnInit {

  @Input('unlockStatus') unlockStatus: boolean;
  @Input('nodeUUID') nodeUUID: string;

  constructor(private modalService: NgbModal, private treeManager: TreeManagerService) {}

  //Variables
  activePage: TreeNode;
  modalRef;
  settingsForm = {
    newOrientation: 'row',
    newChildren: []
  }



  ngOnInit() {
      this.activePage = this.treeManager.getNode(this.nodeUUID);
      if (this.activePage.nodeData === null) {
        // no data, let's set some!
        
        // first we need our two new pages
        let newNode1 = this.treeManager.newNode(this.activePage.uuid);
        let newNode2 = this.treeManager.newNode(this.activePage.uuid);

        //layout
        this.activePage.nodeData = <WidgetSplitConfig> {
          orientation: 'row',
          children: [
            {
              uuid: newNode1,
              order: 1,
              ratio: 1
            },
            {
              uuid: newNode2,
              order: 1,
              ratio: 1
            }            
          ]
        } // end layout
        this.treeManager.saveNodeData(this.activePage.uuid, this.activePage.nodeData);
      } // end if null

      // set some defaults for the form. Complicated as we need to deep copy array (or updating form updates page)
      this.settingsForm.newChildren = [];
      this.activePage.nodeData.children.map(item => {
                                                return {
                                                uuid:item.uuid,
                                                order: item.order,
                                                ratio: item.ratio }}).forEach(item => this.settingsForm.newChildren.push(item));
  }



  openWidgetSettings(content) {
    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then((result) => {
    }, (reason) => {
    });
  }

  saveSettings() {
    this.modalRef.close();

    // orientation
    if (this.settingsForm.newOrientation != this.activePage.nodeData.orientation) {
      this.activePage.nodeData.orientation = this.settingsForm.newOrientation;
    }

    // Children
    //Complicated as we need to deep copy array (or updating form updates page)
    this.activePage.nodeData.children = [];
    this.settingsForm.newChildren.map(item => {
                                                return {
                                                uuid:item.uuid,
                                                order: item.order,
                                                ratio: item.ratio }}).forEach(item => this.activePage.nodeData.children.push(item));;  
    // save
    this.treeManager.saveNodeData(this.activePage.uuid, this.activePage.nodeData);

  }

  newChildNode() {
    let newNode = this.treeManager.newNode(this.activePage.uuid);
    this.activePage.nodeData.children.push(  { uuid: newNode, order: 1, ratio: 1 });
    this.treeManager.saveNodeData(this.activePage.uuid, this.activePage.nodeData);
    this.ngOnInit();
  }


  
}
