To build the npm module (by hand):

1. install nodejs.
2. install npm (if it was not installed with nodejs)
3. install npm module dependencies (see utils/build/package.json)
4. determine the version of PnlTri.js that you want to publish (usually it is specified in src/Pnltri.js as the REVISION)
5. increment the fix number above what was previously published if you are re-publishing an existing PnlTri.js version.
6. add "-dev" to the version number if this is a development branch.
7. create the actual PnlTri.js node module by hand:
	7.1. create directory ./node_module/pnltri if it doesn't exist
	7.2. copy the following files to that new directory:
		- ./example.js
		- ./pnltri.package.json		as  package.json
		- ../../README.md
		- ../../build/pnltri.js
		- ../../build/pnltri.min.js
	7.3. edit file './node_module/pnltri/package.json'
		- replace '%VERSION%' with the version number you want to publish (e.g. 2.1.1)
	7.4. edit file './node_module/pnltri/pnltri.js'
		- insert the contents of file './header.js' at the beginning
		- append the contents of file './footer.js' at the end
	7.5. edit file './node_module/pnltri/pnltri.min.js'
		- insert the contents of file './header.js' at the beginning
		- append the contents of file './footer.js' at the end
		- find 'window.PNLTRI' in the last original line and remove 'window.' from it
8. npm publish node_module/pnltri

