import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface UserRegistrationState {
    isLoading: boolean;
    error: string | null;
    isRegistered: boolean;
}

interface UserRegistrationReturn extends UserRegistrationState {
    checkUserExists: (userIdRaw: string) => Promise<boolean>;
    createUser: (
        userIdRaw: string,
        delegatedWalletHash: string
    ) => Promise<void>;
    registerUser: (
        userIdRaw: string,
        delegatedWalletHash?: string
    ) => Promise<void>;
    isPending: boolean;
    isError: boolean;
    data: unknown;
    refetch: () => void;
}

export function useUserRegistration(): UserRegistrationReturn {
    const [state, setState] = useState<UserRegistrationState>({
        isLoading: false,
        error: null,
        isRegistered: false,
    });

    const queryClient = useQueryClient();

    // Query for checking if user exists
    const userExistsQuery = useQuery({
        queryKey: ['userExists'],
        queryFn: async ({ queryKey }: { queryKey: string[] }) => {
            const userIdRaw = queryKey[1];
            if (!userIdRaw) return null;

            const response = await fetch(
                `/api/users?userIdRaw=${encodeURIComponent(userIdRaw)}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                return null;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        },
        enabled: false, // Don't run automatically
    });

    // Mutation for creating user
    const createUserMutation = useMutation({
        mutationFn: async ({
            userIdRaw,
            delegatedWalletHash,
        }: {
            userIdRaw: string;
            delegatedWalletHash: string;
        }) => {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIdRaw,
                    delegatedWalletHash,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status}: ${errorData}`
                );
            }

            return await response.json();
        },
        onSuccess: () => {
            setState(prev => ({
                ...prev,
                isRegistered: true,
            }));
        },
        onError: error => {
            setState(prev => ({
                ...prev,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create user',
            }));
        },
    });

    // Update state based on query and mutation states
    useEffect(() => {
        if (userExistsQuery.isPending || createUserMutation.isPending) {
            setState(prev => ({ ...prev, isLoading: true, error: null }));
        } else if (userExistsQuery.isSuccess || createUserMutation.isSuccess) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                isRegistered: true,
            }));
        } else if (userExistsQuery.isError || createUserMutation.isError) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error:
                    userExistsQuery.error?.message ||
                    createUserMutation.error?.message ||
                    'Failed to register user',
            }));
        }
    }, [
        userExistsQuery.isPending,
        userExistsQuery.isSuccess,
        userExistsQuery.isError,
        userExistsQuery.error,
        createUserMutation.isPending,
        createUserMutation.isSuccess,
        createUserMutation.isError,
        createUserMutation.error,
    ]);

    const checkUserExists = async (userIdRaw: string): Promise<boolean> => {
        try {
            console.log('Checking if user exists:', userIdRaw);
            const result = await queryClient.fetchQuery({
                queryKey: ['userExists', userIdRaw],
                queryFn: async () => {
                    const response = await fetch(
                        `/api/users?userIdRaw=${encodeURIComponent(userIdRaw)}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    );

                    if (response.ok) {
                        return await response.json();
                    } else if (response.status === 404) {
                        return null;
                    } else {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }
                },
            });

            return result !== null;
        } catch (error) {
            console.error('Error checking user:', error);
            throw error;
        }
    };

    const createUser = async (
        userIdRaw: string,
        delegatedWalletHash: string
    ): Promise<void> => {
        try {
            console.log('Creating user:', { userIdRaw, delegatedWalletHash });
            await createUserMutation.mutateAsync({
                userIdRaw,
                delegatedWalletHash,
            });
            console.log('User created successfully');
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    const registerUser = async (
        userIdRaw: string,
        delegatedWalletHash: string = '-'
    ): Promise<void> => {
        try {
            console.log('Registering user:', userIdRaw);

            // First check if user exists
            const userExists = await checkUserExists(userIdRaw);

            if (!userExists) {
                // Create user if they don't exist
                await createUser(userIdRaw, delegatedWalletHash);
                console.log('User registered successfully');
            } else {
                console.log('User already exists, skipping creation');
            }

            setState(prev => ({
                ...prev,
                isRegistered: true,
            }));
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    return {
        ...state,
        checkUserExists,
        createUser,
        registerUser,
        isPending: userExistsQuery.isPending || createUserMutation.isPending,
        isError: userExistsQuery.isError || createUserMutation.isError,
        data: userExistsQuery.data || createUserMutation.data,
        refetch: userExistsQuery.refetch,
    };
}
