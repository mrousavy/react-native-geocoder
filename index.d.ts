declare module 'react-native-geocoder' {
	export interface Position {
		lat: number;
		lng: number;
	}
	export interface Address {
		country: string;
		streetName: string;
		adminArea?: string;
		locality?: string;
		postalCode?: string;
		streetNumber?: string;
		subAdminArea?: string;
		subLocality?: string;
		formattedAddress?: string;
		position?: Position;
	}

	function fallbackToGoogle(key: string): void;
	function geocodePosition(position: Position): Promise<Address> | Promise<Address[]>;
	function geocodeAddress(address: string): Promise<Address> | Promise<Address[]>;
}
