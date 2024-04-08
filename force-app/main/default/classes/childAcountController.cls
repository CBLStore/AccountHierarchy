/**
 * @description       : 
 * @author            : ChangeMeIn@UserSettingsUnder.SFDoc
 * @group             : 
 * @last modified on  : 02-07-2024
 * @last modified by  : ChangeMeIn@UserSettingsUnder.SFDoc
**/
public with sharing class childAcountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getchildAccount(Id parentId) {
        List<Account> accList = [SELECT Id, Name, Website, Phone,Industry,Type,ParentId FROM Account WHERE ParentId = :parentId];
        if(!accList.isEmpty()){
          System.debug('parentaccList: '+accList);
          return accList;
      } 

      return null;
        
    }

    @AuraEnabled
    public static List<Account> deleteMultipleAccountRecord(List<String> accObjId, Id parentId){
        List<Account> AccobjItem = NEW  List<Account>();
      List<Account> accObjList = [SELECT Id, Name  FROM Account WHERE Id IN:accObjId];
      FOR(Account acc:accObjList){
        AccobjItem.add(acc);
      }
      IF(AccobjItem.size()>0){
          
            DELETE AccobjItem;           
        
          
      }
      return getchildAccount(parentId);
    	
    }

    // remove
    @AuraEnabled
    public static List<Account> removeMultipleAccountRecord(List<String> accObjId, Id parentId){
        List<Account> AccobjItem = NEW  List<Account>();
      List<Account> accObjList1 = [SELECT Id, Name,ParentId  FROM Account WHERE Id IN:accObjId];
      
      
      FOR(Account acc:accObjList1){
        acc.ParentId = null;
        AccobjItem.add(acc);
      }
      IF(AccobjItem.size()>0){
          
        update accObjList1;           
        
          
      }
      return getchildAccount(parentId);
    	
    }

    @AuraEnabled
    public static String updateAccountDetails(Object accountparentData){
        System.debug('accountData: ' +accountparentData);

        List<Account> accountList = (List<Account>) Json.deserialize(
        Json.serialize(accountparentData), List<Account>.class);

        System.debug('accountList: '+accountList);

        if(!accountList.isEmpty())
        {
            update accountList;
            return 'Records successfully updated';
        }
        return 'failed';

    }  
}