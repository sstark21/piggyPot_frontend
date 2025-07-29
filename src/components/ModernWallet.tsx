import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    AppBar,
    Toolbar,
    Chip,
    Tabs,
    Tab,
    TextField,
    Button,
    Slider,
} from '@mui/material';
import {
    ContentCopy as CopyIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import pigIcon from '../assets/pig.png';
import { usePrivy } from '@privy-io/react-auth';
import { useWallets } from '../WalletsContext';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const ModernWallet: React.FC = () => {
    const { logout } = usePrivy();
    const { primaryWallet, delegateWallet } = useWallets();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: { xs: 2, sm: 4 },
                boxSizing: 'border-box',
                width: '100%',
            }}
        >
            {/* Header */}
            <AppBar
                position="static"
                sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'none',
                    borderBottom: 'none',
                    width: { xs: '100%', sm: 400 },
                    maxWidth: { xs: '100%', sm: 400 },
                    borderRadius: { xs: 0, sm: '16px 16px 0 0' },
                    boxSizing: 'border-box',
                }}
            >
                <Toolbar
                    sx={{
                        justifyContent: 'space-between',
                        paddingX: { xs: 2, sm: 2 },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            justifyContent: 'end',
                        }}
                    >
                        <Box
                            component="img"
                            src={pigIcon}
                            alt="PiggyPot"
                            sx={{
                                width: 37,
                                height: 37,
                                objectFit: 'contain',
                                filter: 'brightness(0) invert(1)',
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                textAlign: 'end',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                            }}
                        >
                            PiggyPot
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleLogout}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Main Card */}
            <Card
                sx={{
                    width: { xs: '100%', sm: 400 },
                    maxWidth: { xs: '100%', sm: 400 },
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: { xs: '0 0 16px 16px', sm: '0 0 16px 16px' },
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    height: { xs: 'calc(100vh - 120px)', sm: 600 },
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                }}
            >
                <CardContent
                    sx={{
                        padding: 0,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Primary Wallet Section */}
                    {primaryWallet && (
                        <Box
                            sx={{
                                padding: { xs: 3, sm: 2 },
                                paddingBottom: 2,
                                marginTop: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                }}
                            >
                                Primary Wallet:
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Chip
                                    label={formatAddress(primaryWallet.address)}
                                    size="small"
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: {
                                            xs: '0.875rem',
                                            sm: '1rem',
                                        },
                                        '& .MuiChip-label': {
                                            padding: '8px 12px',
                                        },
                                    }}
                                />
                                <IconButton
                                    onClick={() =>
                                        copyToClipboard(primaryWallet.address)
                                    }
                                    size="small"
                                    sx={{
                                        color: copied
                                            ? '#4caf50'
                                            : 'rgba(255, 255, 255, 0.7)',
                                        '&:hover': {
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.1)',
                                            color: 'white',
                                        },
                                        '&:focus': {
                                            backgroundColor: 'transparent',
                                            outline: 'none',
                                        },
                                        transition: 'all 0.2s ease',
                                        '& .MuiSvgIcon-root': {
                                            width: 15,
                                            height: 15,
                                        },
                                    }}
                                >
                                    <CopyIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                            paddingX: 2,
                            marginBottom: 2,
                            gap: 2,
                        }}
                    >
                        <TextField
                            sx={{
                                width: '40%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'lightgray',
                                    '&.Mui-focused': {
                                        color: 'white',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'gray',
                                },
                                '& .MuiTypography-root': {
                                    color: 'gray',
                                },
                            }}
                            size="small"
                            id="outlined-read-only-input"
                            label="Balance ETH"
                            defaultValue="1"
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />
                        <TextField
                            sx={{
                                width: '35%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'lightgray',
                                    '&.Mui-focused': {
                                        color: 'white',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'lightgray',
                                },
                                '& .MuiTypography-root': {
                                    color: 'gray',
                                },
                            }}
                            size="small"
                            id="outlined-read-only-input"
                            label="Send to Delegate"
                            defaultValue="0.1"
                            type="number"
                        />

                        <Button variant="contained" color="success">
                            Send
                        </Button>
                    </Box>
                    {delegateWallet && (
                        <Box
                            sx={{
                                padding: { xs: 3, sm: 2 },
                                paddingBottom: 2,
                                marginTop: 1,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                }}
                            >
                                Delegate Wallet:
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Chip
                                    label={formatAddress(
                                        delegateWallet.address
                                    )}
                                    size="small"
                                    sx={{
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontWeight: 500,
                                        fontSize: {
                                            xs: '0.875rem',
                                            sm: '1rem',
                                        },
                                        '& .MuiChip-label': {
                                            padding: '8px 12px',
                                        },
                                    }}
                                />
                                <IconButton
                                    onClick={() =>
                                        copyToClipboard(delegateWallet.address)
                                    }
                                    size="small"
                                    sx={{
                                        color: copied
                                            ? '#4caf50'
                                            : 'rgba(255, 255, 255, 0.7)',
                                        '&:hover': {
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.1)',
                                            color: 'white',
                                        },
                                        '&:focus': {
                                            backgroundColor: 'transparent',
                                            outline: 'none',
                                        },
                                        transition: 'all 0.2s ease',
                                        '& .MuiSvgIcon-root': {
                                            width: 15,
                                            height: 15,
                                        },
                                    }}
                                >
                                    <CopyIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'start',
                            alignItems: 'center',
                            paddingX: 2,
                            marginBottom: 2,
                            gap: 2,
                        }}
                    >
                        <TextField
                            sx={{
                                width: '40%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'lightgray',
                                    '&.Mui-focused': {
                                        color: 'white',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'gray',
                                },
                                '& .MuiTypography-root': {
                                    color: 'gray',
                                },
                            }}
                            size="small"
                            id="outlined-read-only-input"
                            label="Balance ETH"
                            defaultValue="1"
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                        />
                        <TextField
                            sx={{
                                width: '35%',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'lightgray',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'lightgray',
                                    '&.Mui-focused': {
                                        color: 'white',
                                    },
                                },
                                '& .MuiInputBase-input': {
                                    color: 'lightgray',
                                },
                                '& .MuiTypography-root': {
                                    color: 'gray',
                                },
                            }}
                            size="small"
                            id="outlined-read-only-input"
                            label="Withdraw to Primary"
                            defaultValue="0.1"
                            type="number"
                        />

                        <Button variant="contained" color="success">
                            Send
                        </Button>
                    </Box>
                    {/* Tabs */}
                    <Box
                        sx={{
                            borderBottom: 1,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            aria-label="wallet tabs"
                            sx={{
                                '& .MuiTabs-indicator': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '& .MuiTab-root': {
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    '&.Mui-selected': {
                                        color: 'white',
                                    },
                                    '&:focus': {
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                    },
                                    '&:focus-visible': {
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                    },
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                    },
                                    '&:active': {
                                        backgroundColor: 'transparent',
                                    },
                                    '&.Mui-focusVisible': {
                                        backgroundColor: 'transparent',
                                    },
                                },
                            }}
                        >
                            <Tab
                                label="Invest"
                                disableRipple
                                {...a11yProps(0)}
                            />
                            <Tab label="Logs" disableRipple {...a11yProps(1)} />
                        </Tabs>
                    </Box>

                    {/* Tab Panels */}
                    <CustomTabPanel value={activeTab} index={0}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#00e676',
                                textAlign: 'center',
                            }}
                        >
                            INVESTMENT MONEY NOW!
                        </Typography>

                        <Slider
                            aria-label="Investment Percentage"
                            defaultValue={30}
                            getAriaValueText={value => `${value}%`}
                            color="success"
                            step={10}
                            marks={[
                                { value: 10, label: '10%' },
                                { value: 20, label: '' },
                                { value: 30, label: '30%' },
                                { value: 40, label: '' },
                                { value: 50, label: '50%' },
                                { value: 60, label: '' },
                                { value: 70, label: '70%' },
                                { value: 80, label: '' },
                                { value: 90, label: '90%' },
                            ]}
                            min={0}
                            max={100}
                            sx={{
                                width: '100%',
                                '& .MuiSlider-track': {
                                    height: 15,
                                    background:
                                        'linear-gradient(to right, #ff1744, #00ff41)',
                                },
                                '& .MuiSlider-rail': {
                                    height: 15,
                                    // backgroundColor: 'transparent',
                                    background:
                                        'linear-gradient(to right, #ff1744, #00ff41)',
                                },
                                '& .MuiSlider-thumb': {
                                    backgroundColor: 'white',
                                    border: '2px solid green',
                                },
                                '& .MuiSlider-markLabel': {
                                    color: 'white',
                                    fontSize: '0.875rem',
                                },
                            }}
                        />
                    </CustomTabPanel>

                    <CustomTabPanel value={activeTab} index={1}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                textAlign: 'center',
                            }}
                        >
                            TRANSACTION LOGS WILL BE DISPLAYED HERE
                        </Typography>
                    </CustomTabPanel>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ModernWallet;
