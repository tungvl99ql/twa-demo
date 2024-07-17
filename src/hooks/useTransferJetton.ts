import { useState } from "react";
import JettonTransfer from "../contracts/JettonTransfer";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonConnect } from "./useTonConnect";
import { Address, OpenedContract } from "ton-core";
import { useQuery } from "@tanstack/react-query";
import { CHAIN } from "@tonconnect/protocol";

export function useJettonTransferContract() {
    const { client } = useTonClient();
    const { sender, network } = useTonConnect();

    const jettonTransferContract = useAsyncInitialize(async () => {
        if (!client) return;
        const contract = new JettonTransfer(
            Address.parse(
                network === CHAIN.MAINNET
                    ? "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs"
                    : "kQD0GKBM8ZbryVk2aESmzfU6b9b_8era_IkvBSELujFZPsyy"
            )
        );
        return client.open(contract) as OpenedContract<JettonTransfer>;
    }, [client]);

    const { data, isFetching } = useQuery(
        ["balance"],
        async () => {
            if (!jettonTransferContract) return null;
            return (await jettonTransferContract!.getBalance()).toString();
        },
        { refetchInterval: 3000 }
    );

    return {
        balance: isFetching ? null : data,
        address: jettonTransferContract?.address.toString(),
        sendTransfer: (toAddress: string, amount: number) => {
            const recipientAddress = Address.parse(toAddress);
            return jettonTransferContract?.sendTransfer(sender, recipientAddress, amount);
        },
    };
}
