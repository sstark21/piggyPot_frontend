import React, { useState } from 'react';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';
import { AppContent } from '../App'; // Импортируем старый AppContent
import ModernWallet from './ModernWallet';
import { Providers } from '../App';
import { WalletProvider } from '../WalletsContext';
import AppKitProvider from '../WagmiContext';

const AppWrapper: React.FC = () => {
    const [useModernDesign, setUseModernDesign] = useState(true);

    return (
        <AppKitProvider>
            <Providers>
                <WalletProvider>
                    <Box sx={{ position: 'relative' }}>
                        {/* Toggle Switch */}
                        <Box
                            sx={{
                                position: 'fixed',
                                top: 16,
                                right: 16,
                                zIndex: 9999,
                                background: 'rgba(0, 0, 0, 0.8)',
                                padding: 1,
                                borderRadius: 2,
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={useModernDesign}
                                        onChange={e =>
                                            setUseModernDesign(e.target.checked)
                                        }
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked':
                                                {
                                                    color: '#4caf50',
                                                },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                                                {
                                                    backgroundColor: '#4caf50',
                                                },
                                        }}
                                    />
                                }
                                label={
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'white',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        {useModernDesign ? 'Новый' : 'Старый'}
                                    </Typography>
                                }
                            />
                        </Box>

                        {/* Render appropriate component */}
                        {useModernDesign ? <ModernWallet /> : <AppContent />}
                    </Box>
                </WalletProvider>
            </Providers>
        </AppKitProvider>
    );
};

export default AppWrapper;
