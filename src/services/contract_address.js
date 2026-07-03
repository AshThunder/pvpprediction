export const CONTRACT_ADDRESSES = {
  61999: '0xaa9a0916a0795ae7105c5577c458591811104424', // StudioNet
  4221: '0xD6243C1b01826e6E3f05e03C00624f960F594868'  // Bradbury
};
export const CONTRACT_ADDRESS = CONTRACT_ADDRESSES[61999];
/** `false` for older deployments on Bradbury that do not expose get_balance; set `true` by deploy after a successful probe. */
export const CONTRACT_SUPPORTS_BALANCE = true;
