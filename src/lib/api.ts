import axios, { AxiosError }  from 'axios';
import { ethers } from 'ethers';

const api = axios.create({ baseURL: 'https://dev.maikyman.xyz/api' });

/**
 * Save wallet to the database
 * @param userIdRaw - privy user id
 * @param delegatedWalletHash - delegated wallet hash
 * @returns response from the server
 */
export async function createUser(userIdRaw: string, delegatedWalletHash: string) {
  try {
    console.log('Sending data:', { userIdRaw, delegatedWalletHash });
    const response = await api.post('/users/create', { userIdRaw, delegatedWalletHash });
    console.log('Server response:', response.data);
    return response;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error saving wallet:', {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data
    });
    throw error;
  }
}

/**
 * Get user from the database
 * @param userIdRaw - privy user id
 * @returns user
 */
export async function getUser(userIdRaw: string) {
  try {
      const res = await api.get(`/users/get?userIdRaw=${userIdRaw}`);
      console.log('res', res);
    return {
        userIdRaw,
        delegatedWalletHash: res.data.data.delegatedWalletHash
    };
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}



export async function getBalance(address: string) {
    if (!address) {
        return '0';
    }
    const rpcUrl = import.meta.env.VITE_CHAIN_RPC_URL;

    console.log('rpcUrl', rpcUrl, address);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);
    return balanceEth;
}