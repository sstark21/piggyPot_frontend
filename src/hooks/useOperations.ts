// src/hooks/useOperations.ts
import { callOperationsAPI } from '@/libs/1inch/callApi';
import { useCallback, useState } from 'react';

interface OperationsResponse {
    operations: Array<{
        id: string;
        userIdRaw: string;
    }>;
}


export const useOperations = () => {
    const [operations, setOperations] = useState<
        OperationsResponse['operations']
    >([]);

    const fetchOperations = useCallback(async (id: string) => {
        try {
            const response = await callOperationsAPI<OperationsResponse>({
                userIdRaw: id,
            });
            setOperations(response.operations || []);
        } catch (error) {
            console.error(error);
        }
    }, []);

    return {
        fetchOperations,
        operations,
    };
};
