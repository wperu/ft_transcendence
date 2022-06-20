
if [[ $BUILD == "dev" ]]; then
	echo "start dev:"
	npm install --prefix /vol/app; npm run start --prefix /vol/app
elif [[ $BUILD == "prod" ]]; then
	echo "start prod:"
	npm install --prefix /vol/app; npm run build --prefix /vol/app
	nginx -g 'daemon off;'
fi

