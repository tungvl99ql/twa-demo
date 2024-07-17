import {
    Contract,
    ContractProvider,
    Sender,
    Address,
    Cell,
    contractAddress,
    beginCell,
  } from "ton-core";
  
  export default class JettonTransfer implements Contract {
    static createForDeploy(code: Cell, initialBalance: number): JettonTransfer {
      const data = beginCell().storeUint(initialBalance, 64).endCell();
      const workchain = 0; // deploy to workchain 0
      const address = contractAddress(workchain, { code, data });
      return new JettonTransfer(address, { code, data });
    }
  
    async sendDeploy(provider: ContractProvider, via: Sender) {
      await provider.internal(via, {
        value: "0.01", // gửi 0.01 TON đến hợp đồng để trả phí thuê
        bounce: false,
      });
    }
  
    async getBalance(provider: ContractProvider) {
      const { stack } = await provider.get("balance", []);
      return stack.readBigNumber();
    }
  
    async sendTransfer(provider: ContractProvider, via: Sender, toAddress: Address, amount: number) {
      const messageBody = beginCell()
        .storeUint(2, 32) // op (op #2 = transfer)
        .storeUint(0, 64) // query id
        .storeAddress(toAddress) // địa chỉ người nhận
        .storeUint(amount, 64) // số lượng Jetton để chuyển
        .endCell();
      await provider.internal(via, {
        value: "0.002", // gửi 0.002 TON để trả phí gas
        body: messageBody,
      });
    }
  
    constructor(
      readonly address: Address,
      readonly init?: { code: Cell; data: Cell }
    ) {}
  }
  