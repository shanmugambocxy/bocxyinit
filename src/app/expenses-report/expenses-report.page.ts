import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { AppointmentListService } from '../_services/appointmentlist.service';
import { ToastService } from '../_services/toast.service';
import { AddAnotherServiceService } from '../addanotherservice/addanotherservice.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-expenses-report',
  templateUrl: './expenses-report.page.html',
  styleUrls: ['./expenses-report.page.scss'],
})
export class ExpensesReportPage implements OnInit {
  // orderForm: FormGroup;
  expensesForm: FormGroup;

  items: FormArray;
  startDate: any = new Date().toISOString();
  expensesTypeList: any = [{ id: 1, value: 'Expenses' }, { id: 2, value: 'Income' }]
  selectedExpenses: any;
  totalExpenses: number = 0;
  totalIncome: number = 0;
  merchantStoreId: number = 0;
  staffList: any = [];
  stylistId: number = 0;
  isedit: boolean = false;
  getExpense: any = [];
  maxDate: any;

  constructor(private formBuilder: FormBuilder,
    private appointmentListService: AppointmentListService,
    private toastService: ToastService,
    private httpService: AddAnotherServiceService,
    private navCtrl: NavController,

  ) {
    let merchantStoreId = localStorage.getItem('merchant_store_id');
    this.merchantStoreId = merchantStoreId ? JSON.parse(merchantStoreId) : 0;


  }

  ngOnInit() {

    this.expensesForm = new FormGroup({
      items: new FormArray([])
    });
    // this.addItem()
    this.intitialItem();

  }

  async ionViewDidEnter() {
    let maxDate = new Date().toISOString();
    this.maxDate = "2024-02-02";

    this.refreshData();
    await this.stylistList();
    // await this.onGetExpenses();

  }
  intitialItem() {
    this.items = this.expensesForm.get('items') as FormArray;
    this.items.push(this.initialCreate1());
    this.items.push(this.initialCreate2());
    this.items.push(this.initialCreate3());
    this.items.push(this.initialCreate4());
    this.items.push(this.initialCreate5());
    this.items.push(this.initialCreate6());
    this.items.push(this.initialCreate7());
    this.items.push(this.initialCreate8());
    this.items.push(this.initialCreate9());


  }

  addItem(): void {
    this.items = this.expensesForm.get('items') as FormArray;
    this.items.push(this.createItem());
  }
  createItem(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['', Validators.required],
      amount: ['', Validators.required],
      type: 1

    });
  }

  deleteExpenses(index) {
    debugger
    const add = this.expensesForm.get('items') as FormArray;
    add.removeAt(index);
  }
  stylistList() {
    this.httpService.getAllProfessionaList().subscribe((response) => {
      if (response && response.status === 'SUCCESS') {
        this.staffList = [];
        this.staffList = response.data;
        this.onGetExpenses();

      }
      else {
        this.staffList = [];

        this.toastService.showToast('Something went wrong. Please try again');
      }
    });
  }
  onChangeStaff(event) {

  }
  startDateChange() {
    this.onGetExpenses();
  }
  onChangeExpensesType(event: any) {
    this.onChangeAmount('');
  }
  onGetExpenses() {
    debugger
    let startDate: any;
    let endDate: any;
    let currentdate = new Date(this.startDate)
    startDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '00' + ":"
      + '00' + ":"
      + '00';
    endDate = currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1).toString().padStart(2, '0')
      + "-" + currentdate.getDate().toString().padStart(2, '0') + ' ' + '24' + ":"
      + '00' + ":"
      + '00';
    let payload = {
      "merchantStoreId": this.merchantStoreId,
      "startDate": startDate,
      "endDate": endDate
    }
    this.appointmentListService.getExpensesByMerchantId(payload).subscribe(res => {
      if (res && res.data.length > 0) {
        this.getExpense = res.data;
        this.isedit = true;
        let getexpensesByStoreList = res.data.filter(x => x.access == 'STORE');

        let customeData = getexpensesByStoreList.filter(x => (x.fieldname != 'Tea') && (x.fieldname != 'Service Incentive') && (x.fieldname != 'product incentive') && (x.fieldname != 'Transgender') && (x.fieldname != 'Petty Cash') && (x.fieldname != 'Water Bottle') && (x.fieldname != 'Laundry') && (x.fieldname != 'Office') && (x.fieldname != 'OT'))
        let tea = getexpensesByStoreList.filter(x => x.fieldname == 'Tea');
        let serviceIncentive = getexpensesByStoreList.filter(x => x.fieldname == 'Service Incentive');
        let productIncentive = getexpensesByStoreList.filter(x => x.fieldname == 'product incentive');
        let transgender = getexpensesByStoreList.filter(x => x.fieldname == 'Transgender');
        let pettyCash = getexpensesByStoreList.filter(x => x.fieldname == 'Petty Cash');
        let waterBottle = getexpensesByStoreList.filter(x => x.fieldname == 'Water Bottle');
        let laundry = getexpensesByStoreList.filter(x => x.fieldname == 'Laundry');
        let Office = getexpensesByStoreList.filter(x => x.fieldname == 'Office');
        let OT = getexpensesByStoreList.filter(x => x.fieldname == 'OT');
        // setTimeout(() => {
        //   this.stylistId = tea && tea.length > 0 ? tea[0].staff_Id : serviceIncentive[0].staff_Id;

        // }, 100);
        this.stylistId = tea && tea.length > 0 ? tea[0].staff_Id : serviceIncentive[0].staff_Id;
        this.expensesForm = new FormGroup({
          items: new FormArray([])
        });
        this.items = this.expensesForm.get('items') as FormArray;

        if (tea && tea.length > 0) {
          this.items.push(this.initialCreate1data(tea[0].fieldvalue, tea[0].type));

        } else {
          this.items.push(this.initialCreate1());

        }
        if (serviceIncentive && serviceIncentive.length > 0) {
          this.items.push(this.initialCreate2data(serviceIncentive[0].fieldvalue, serviceIncentive[0].type));

        } else {
          this.items.push(this.initialCreate2());

        }
        if (productIncentive && productIncentive.length > 0) {
          this.items.push(this.initialCreate3data(productIncentive[0].fieldvalue, productIncentive[0].type));

        } else {
          this.items.push(this.initialCreate3());

        }


        if (transgender && transgender.length > 0) {
          this.items.push(this.initialCreate4data(transgender[0].fieldvalue, transgender[0].type));

        } else {
          this.items.push(this.initialCreate4());

        }
        if (pettyCash && pettyCash.length > 0) {
          this.items.push(this.initialCreate5data(pettyCash[0].fieldvalue, pettyCash[0].type));

        } else {
          this.items.push(this.initialCreate5());

        }
        if (waterBottle && waterBottle.length > 0) {
          this.items.push(this.initialCreate6data(waterBottle[0].fieldvalue, waterBottle[0].type));

        } else {
          this.items.push(this.initialCreate6());

        }
        if (laundry && laundry.length > 0) {
          this.items.push(this.initialCreate7data(laundry[0].fieldvalue, laundry[0].type));

        } else {
          this.items.push(this.initialCreate7());

        }
        if (Office && Office.length > 0) {
          this.items.push(this.initialCreate8data(Office[0].fieldvalue, Office[0].type));

        } else {
          this.items.push(this.initialCreate8());

        }
        if (OT && OT.length > 0) {
          this.items.push(this.initialCreate9data(OT[0].fieldvalue, OT[0].type));

        } else {
          this.items.push(this.initialCreate8());

        }

        customeData.forEach(item => {
          const formGroup = this.createItem(); // Use your method to create the form group
          formGroup.patchValue({
            expensesType: item.type,
            title: item.fieldname,
            amount: item.fieldvalue,
            type: 1

          }); // Use patchValue to set values from the data
          this.items.push(formGroup);
        });
        this.onChangeAmount('');

      } else {
        this.getExpense = [];

        this.refreshData();
        this.isedit = false;

      }
    })
  }
  onChangeAmount(event: any) {
    let expensesTotalAmount = [];
    let incomeTotalAmount = [];
    this.expensesForm.get('items')['controls'].forEach(element => {
      // totalAmount = totalAmount + element.value.amount ? JSON.parse(element.value.amount) : 0
      if (element.value.expensesType == 'Expenses') {
        expensesTotalAmount.push(element.value.amount ? element.value.amount : '0');

      } else {
        incomeTotalAmount.push(element.value.amount ? element.value.amount : '0');

      }

    });
    let expenseAmount = expensesTotalAmount.map(data => JSON.parse(data));
    let incomeAmount = incomeTotalAmount.map(data => JSON.parse(data));
    this.totalExpenses = _.sumBy(expenseAmount) ? _.sumBy(expenseAmount) : 0;
    this.totalIncome = _.sumBy(incomeAmount) ? _.sumBy(incomeAmount) : 0;

  }
  numberValidate(evt) {
    // tslint:disable-next-line: deprecation
    debugger
    const theEvent = evt || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    const regex = /[0-9]/;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) {
        theEvent.preventDefault();
      }
    }

  }
  saveExpensesData() {
    debugger
    if (this.expensesForm.valid) {
      if (!this.startDate) {
        this.toastService.showToast('please select the date');
        return
      }
      if (!this.stylistId) {
        this.toastService.showToast('please select the stylist');
        return
      }
      let staffName: any;
      let staffId: any;

      let getStaff = this.staffList.filter(x => x.accountId == this.stylistId);
      if (getStaff && getStaff.length > 0) {
        staffName = getStaff[0].firstName;
        staffId = getStaff[0].accountId;
      } else {
        staffName = '';
        staffId = 0;
      }

      var date = new Date(this.startDate);

      let entryMonth = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0')
        + "-" + date.getDate().toString().padStart(2, '0') + ' ' + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + ":" + '00';
      console.log('entryMonth', entryMonth);

      let formData = [];
      let expenseData = [];
      let incomeData = [];
      this.expensesForm.get('items')['controls'].forEach(element => {
        element.value.amount = element.value.amount == '' ? 0 : JSON.parse(element.value.amount);

        // formData.push({ title: element.value.title, amount: element.value.amount, expensesType: element.value.expensesType });
        if (element.value.expensesType == "Expenses") {
          expenseData.push({ title: element.value.title, amount: element.value.amount, access: 'STORE' })

        } else {
          incomeData.push({ title: element.value.title, amount: element.value.amount, access: 'STORE' })
        }

      });
      let expenseResult = expenseData;
      let incomeResult = incomeData
      // let convertData = formData;
      // console.log('convertData', convertData);
      // let expenseData = convertData.filter(x => x.expensesType == "Expenses");
      // let incomeData = convertData.filter(x => x.expensesType != "Expenses");
      // let expenseResult=[];
      // let incomeResult=[];
      // expenseData.forEach(element => {
      //   expenseResult.push()
      // });
      // let expensekey = expenseData.map(data => data.title);

      // let expensevalue = expenseData.map(data => (data.amount == '' ? data.amount = 0 : data.amount = JSON.parse(data.amount)));
      // let incomekey = incomeData.map(data => data.title);

      // let incomevalue = incomeData.map(data => (data.amount == '' ? data.amount = 0 : data.amount = JSON.parse(data.amount)));

      // // let type = formData.map(data => data.expensesType);
      // const expenseResult = {};
      // const incomeResult = {};
      // for (let i = 0; i < expensekey.length; i++) {
      //   expenseResult[expensekey[i]] = expensevalue[i];
      // }
      // for (let i = 0; i < incomekey.length; i++) {
      //   incomeResult[incomekey[i]] = incomevalue[i];
      // }
      // let merchantStoreId:any = localStorage.getItem('merchant_store_id');
      //   console.log('expenseResult', expenseResult);
      // console.log('incomeResult', incomeResult);

      let payloadData = [{
        "merchantStoreId": this.merchantStoreId,
        "storeSales": 0,
        "balanceamount": 0,
        "fields": expenseResult,
        "date": entryMonth,
        "type": "Expenses",
        "staff_Id": staffId,
        "staff_name": staffName
      },
      {
        "merchantStoreId": this.merchantStoreId,
        "storeSales": 0,
        "balanceamount": 0,
        "fields": incomeResult,
        "date": entryMonth,
        "type": "Income",
        "staff_Id": staffId,
        "staff_name": staffName

      }];
      console.log('payloadData', payloadData);
      this.appointmentListService.createExpenseData(payloadData).subscribe(res => {
        if (res && res.data.length > 0) {
          this.toastService.showToast('Expenses Created SuccessFully.');
          this.refreshData();
          this.discard();
        } else {
          // this.refreshData();

        }

      }), err => {
        this.refreshData();

      }

    } else {
      this.toastService.showToast('please fill all the required fields');
      this.expensesForm.markAllAsTouched();
    }
  }
  updateExpensesData() {
    debugger
    if (this.expensesForm.valid) {
      if (!this.startDate) {
        this.toastService.showToast('please select the date');
        return
      }
      if (!this.stylistId) {
        this.toastService.showToast('please select the stylist');
        return
      }
      let staffName: any;
      let staffId: any;

      let getStaff = this.staffList.filter(x => x.accountId == this.stylistId);
      if (getStaff && getStaff.length > 0) {
        staffName = getStaff[0].firstName;
        staffId = getStaff[0].accountId;
      } else {
        staffName = '';
        staffId = 0;
      }

      var date = new Date(this.startDate);

      let entryMonth = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0')
        + "-" + date.getDate().toString().padStart(2, '0') + ' ' + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + ":" + '00';
      console.log('entryMonth', entryMonth);

      let formData = [];
      let expenseData = [];
      let incomeData = [];
      this.expensesForm.get('items')['controls'].forEach(element => {
        element.value.amount = element.value.amount == '' ? 0 : JSON.parse(element.value.amount);

        // formData.push({ title: element.value.title, amount: element.value.amount, expensesType: element.value.expensesType });
        if (element.value.expensesType == "Expenses") {
          expenseData.push({ title: element.value.title, amount: element.value.amount, access: 'STORE' })

        } else {
          incomeData.push({ title: element.value.title, amount: element.value.amount, access: 'STORE' })
        }

      });
      let expenseResult = expenseData;
      let incomeResult = incomeData


      let payloadData = [{
        "Id": this.getExpense[0].id,
        "storeSales": 0,
        "balanceamount": 0,
        "fields": expenseResult,
        "date": entryMonth,
        "type": "Expenses",
        "staff_Id": staffId,
        "staff_name": staffName
      },
      {
        "Id": this.getExpense[0].id,
        "storeSales": 0,
        "balanceamount": 0,
        "fields": incomeResult,
        "date": entryMonth,
        "type": "Income",
        "staff_Id": staffId,
        "staff_name": staffName

      }];
      console.log('payloadData', payloadData);
      this.appointmentListService.updateExpenseData(payloadData).subscribe(res => {
        if (res && res[0].status == "Success") {
          this.toastService.showToast('Expenses Updated SuccessFully.');
          this.refreshData();
          this.discard();
        } else {
          // this.refreshData();

        }

      }), err => {
        this.refreshData();

      }

    } else {
      this.toastService.showToast('please fill all the required fields');
      this.expensesForm.markAllAsTouched();
    }

  }
  initialCreate1(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Tea'],
      amount: [''],
      type: 0
    },);
  }
  initialCreate2(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Service Incentive'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate3(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['product incentive'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate4(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Transgender'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate5(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Petty Cash'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate6(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Water Bottle'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate7(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Laundry'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate8(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['Office'],
      amount: [''],
      type: 0

    },);
  }
  initialCreate9(): FormGroup {
    return this.formBuilder.group({
      expensesType: ['Expenses'],
      title: ['OT'],
      amount: [''],
      type: 0

    },);
  }

  initialCreate1data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Tea'],
      amount: [amount],
      type: 0
    },);
  }
  initialCreate2data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Service Incentive'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate3data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['product incentive'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate4data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Transgender'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate5data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Petty Cash'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate6data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Water Bottle'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate7data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Laundry'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate8data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['Office'],
      amount: [amount],
      type: 0

    },);
  }
  initialCreate9data(amount, type): FormGroup {
    return this.formBuilder.group({
      expensesType: [type],
      title: ['OT'],
      amount: [amount],
      type: 0

    },);
  }

  refreshData() {
    this.stylistId = 0;
    this.totalExpenses = 0;
    this.totalIncome = 0;
    this.expensesForm = new FormGroup({
      items: new FormArray([])
    });
    // this.addItem()
    this.intitialItem();
  }
  discard() {
    this.navCtrl.navigateRoot('/home');

  }
}
