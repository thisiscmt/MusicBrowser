from werkzeug.middleware.proxy_fix import ProxyFix

from src import app


print("Starting the Music Browser API")

if __name__ == "__main__":
    # The two options set to False allow the PyCharm debugger to step in and handle errors
    app.run(debug=True, use_debugger=False, use_reloader=False, passthrough_errors=True)
else:
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
