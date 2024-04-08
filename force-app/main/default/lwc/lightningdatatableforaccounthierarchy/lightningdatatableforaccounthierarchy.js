import { LightningElement, wire,api,track } from 'lwc';
//import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getchildAccount from '@salesforce/apex/childAcountController.getchildAccount';
import deleteMultipleAccountRecord from '@salesforce/apex/childAcountController.deleteMultipleAccountRecord';
import removeMultipleAccountRecord from '@salesforce/apex/childAcountController.removeMultipleAccountRecord';
import updateAccountDetails from '@salesforce/apex/childAcountController.updateAccountDetails';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';




const actions = [
    { label: 'View', name: 'view' },
    { label: 'Edit', name: 'edit' },
    { label: 'Delete', name: 'delete' },
  ];

//columns

const columns = [
    {
        label: 'Account Name',
        fieldName: 'AccountName',
        type: 'url',
        typeAttributes: {
            label: { fieldName: 'Name' },
            target: '_blank',
           
          },
        editable: true  
    }, {
        label: 'Phone',
        fieldName: 'Phone',
        type: 'phone',
        editable: true,
    }, {
        label: 'Industry',
        fieldName: 'Industry',
        type: 'text',
        editable: true,
    }, {
        label: 'Type',
        fieldName: 'Type',
        type: 'text',
        editable: true
    },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    }, 
    
];

export default class Lightningdatatableforaccounthierarchy extends NavigationMixin (LightningElement) {
    @api recordId;
    @track datalist = true;    //assigned the value as true
    @api selectedAccountIdList=[];   //selectedaccountid
    @track errorMsg;
    @track data;
    columns = columns;
    //data = [];
    saveDraftValue = [];
    @track parentId;
    @track isDeleteButtonDisabled = true;
    pageTitle = 'Child Account Hierarchy';
   

    //entire wire response is result and refreshapex is applied on result not result.data

   @wire(getchildAccount, { parentId: '$recordId' })
    wiredChildAccounts(result) {    
        this.refreshTable = result;
        
        if (result.data) {
            this.datalist = true;
            this.data = result.data;
           console.log('this.data result: ', this.data);
            const flattenedData = this.data.map(account => ({
                Id: account.Id,
                Name: account.Name,
                Type: account.Type,
                Phone: account.Phone,
                Industry: account.Industry,
                AccountName: '/' + account.Id,    //Link for childAccount
        
              
                
              }));
              this.data = flattenedData;
              console.log('this.data:', JSON.stringify(this.data));
        
           
        } 
        
        else {
           
            this.datalist = false;
            
            console.error('Error fetching child accounts:');
          
        }
        
     
    }
    
//on clicking save button

  handleSave(event){
   
    const updatedfields = event.detail.draftValues;
    console.log("Updatedfield: ",  JSON.stringify(updatedfields));
    console.log("Updatedfield: ", updatedfields);

   

// calling the apex method for updating the fields
   
    updateAccountDetails({accountparentData: updatedfields })
    .then( result =>{
      console.log("apex result: "+JSON.stringify(result));
      const toastEventMsg = new ShowToastEvent({
        title:'Success!',
        message:'Records Updated successfully!!',
        variant:'success'
      });
      this.dispatchEvent(toastEventMsg);

      // Clear all draft values in the datatable
      this.saveDraftValue = [];

      //updatedfield = [];  
      return refreshApex(this.refreshTable);
      


    }).catch(error=>{
      console.log("err:"+JSON.stringify(error));
       this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error',
          message: 'An Error occured!',
          variant: 'error'

        })
      ) 


    })
   

  }
    
// Row actions (View, edit,delete)

  handleRowAction( event) {
     const actionName = event.detail.action.name;
     const row = event.detail.row;
     console.log('Action Name:', actionName);
     console.log('Row Data:', JSON.stringify(row));
     switch(actionName) {
         case 'view':
           
             this[NavigationMixin.Navigate]({
                 type: 'standard__recordPage',
                 attributes: {
                     recordId: row.Id,
                     objectApiName: 'Account',
                     actionName: 'view'
                     
                 }
                 
             });
             break;
         case 'edit':
             this[NavigationMixin.Navigate]({
                 type: 'standard__recordPage',
                 attributes: {
                     recordId: row.Id,
                     objectApiName: 'Account',
                     actionName: 'edit'
                     
                 }
             });
 
             
             break;

            case 'delete':
                this.deleteAccountRowAction();
                break;
         default:
     }
   }

// multiselect and single select delete

   getSelectedIdAction(event){
    const selectedAccountRows = event.detail.selectedRows;
    console.log('selectedAccountRows# ' + JSON.stringify(selectedAccountRows));
    //this.selectedAccountRows=[];
    
        // Update the selectedAccountIdList only if at least one record is selected
        this.selectedAccountIdList = selectedAccountRows.map(row => row.Id);

      // Update the delete button's disabled status based on the number of selected records
      this.isDeleteButtonDisabled = this.selectedAccountIdList.length === 0;

  
}
deleteAccountRowAction(){

    if (this.isDeleteButtonDisabled) {
        // Display a message to the user that no records are selected
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Please select at least one record to delete.',
                variant: 'error'
            })
        );
        return;
    }

        deleteMultipleAccountRecord({accObjId:this.selectedAccountIdList, parentId: this.parentId })
    .then(()=>{
        this.template.querySelector('lightning-datatable').selectedAccountRows=[];

        const toastEvent = new ShowToastEvent({
            title:'Success!',
            message:'Record deleted successfully',
            variant:'success'
          });
          this.dispatchEvent(toastEvent);

      
      //once record gets deleted on click of delete want to refresh the table as calling refreshapex
      return refreshApex(this.refreshTable);

         
        
    })
    .catch(error =>{
        this.errorMsg =error;
        console.log('unable to delete the record due to ' + JSON.stringify(this.errorMsg));
    });

    
    
}
removeAccountRowAction(){

    removeMultipleAccountRecord({accObjId:this.selectedAccountIdList, parentId: this.parentId })
    .then(()=>{
        this.template.querySelector('lightning-datatable').selectedAccountRows=[];

        const toastEvent = new ShowToastEvent({
            title:'Success!',
            message:'Record removed successfully',
            variant:'success'
          });
          this.dispatchEvent(toastEvent);

      
      //once record gets deleted on click of delete want to refresh the table as calling refreshapex
      return refreshApex(this.refreshTable);

         
        
    })
    .catch(error =>{
        this.errorMsg =error;
        console.log('unable to remove the record due to ' + JSON.stringify(this.errorMsg));
    });


}



}