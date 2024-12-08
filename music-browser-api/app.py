import sys
from werkzeug.middleware.proxy_fix import ProxyFix

from src import app
from src.services.utils import supported_data_provider

if 'DATA_PROVIDER' not in app.config:
    print('Missing data provider configuration, exiting the app')
    sys.exit()
elif not supported_data_provider(app.config['DATA_PROVIDER']):
    print('Unsupported data provider, exiting the app')
    sys.exit()

print('Starting the Music Browser API')

if __name__ == '__main__':
    # The two options set to False allow the PyCharm debugger to step in and handle errors
    app.run(debug=True, use_debugger=False, use_reloader=False, passthrough_errors=True)
else:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
