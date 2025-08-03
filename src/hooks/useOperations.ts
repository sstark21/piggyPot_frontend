// src/hooks/useOperations.ts
import { useState } from 'react';
import {
    OperationsReturn,
    OperationsState,
    OperationsResponse,
} from '@/types/backend/operations';

// Define operation status types
export type OperationStatus =
    | 'RECOMMENDATION_INIT'
    | 'RECOMMENDATION_FINISHED'
    | 'RECOMMENDATION_FAILED'
    | 'DEPOSIT_INIT'
    | 'DEPOSIT_FAILED'
    | 'ACTIVE_INVESTMENT'
    | 'CLOSED_INVESTMENT';

export const useOperations = (): OperationsReturn => {
    const [state, setState] = useState<OperationsState>({
        isLoading: false,
        error: null,
        operations: [],
    });

    const fetchOperations = async (userIdRaw: string): Promise<void> => {
        try {
            console.log('Fetching operations for user:', userIdRaw);
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch(
                `/api/operations?userIdRaw=${encodeURIComponent(userIdRaw)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = (await response.json()) as OperationsResponse;

            setState(prev => ({
                ...prev,
                isLoading: false,
                operations: result.data || [],
            }));
        } catch (error) {
            console.error('Error fetching operations:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch operations',
            }));
            throw error;
        }
    };

    const updateOperationStatus = async (
        operationId: string,
        status: OperationStatus
    ): Promise<void> => {
        try {
            console.log('Updating operation status:', { operationId, status });
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch(
                `/api/operations/update?operationId=${encodeURIComponent(operationId)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Optionally refresh operations after update
            // You can call fetchOperations here if needed

            setState(prev => ({
                ...prev,
                isLoading: false,
            }));
        } catch (error) {
            console.error('Error updating operation status:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update operation status',
            }));
            throw error;
        }
    };

    return {
        ...state,
        fetchOperations,
        updateOperationStatus,
        isPending: state.isLoading,
        isError: !!state.error,
        data: { success: true, data: state.operations },
        refetch: () => {}, // No refetch functionality for now
    };
};
