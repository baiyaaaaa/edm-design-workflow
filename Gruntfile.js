module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Assembles your email content with html layout
        assemble: {
          options: {
            layoutdir: 'src/layouts',
            partials: ['src/includes/**/*.hbs','src/includes/styles/*.css'],
            flatten: true
          },
          edm: {
            src: ['src/templates/template-1.hbs'],
            dest: 'dist/'
          }
        },

        // Inlines your css
        premailer: {
          simple: {
            options: {
              removeComments: false,
              removeClasses: true
            },
            files: {
                'dist/template-1.html': ['dist/template-1.html']
            }
          }
        },

        // Watches for changes to css or email templates then runs grunt tasks
        watch: {
          files: ['src/templates/*','src/layouts/*'],
          tasks: ['default']
        },

        // Use Mailgun option if you want to email the design to your inbox or to something like Litmus
        mailgun: {
          mailer: {
            options: {
              key: 'key-14b5adee2529b8692608955d25d2292f', // Enter your Mailgun API key here
              sender: 'postmaster@sandbox476ee997256645898d89a8708dc12f5e.mailgun.org', // Change this
              recipient: 'bigpet1991@163.com, 286030975@qq.com, hpzeng@Ctrip.com', // Change this
              subject: 'This is a test email'
            },
            src: ['dist/template-1.html']
          }
        },

        // Use Rackspace Cloud Files if you're using images in your email
        cloudfiles: {
          prod: {
            'user': 'Rackspace Cloud Username', // Change this
            'key': 'Rackspace Cloud API Key', // Change this
            'region': 'ORD', // Might need to change this
            'upload': [{
              'container': 'Files Container Name', // Change this
              'src': 'src/img/*',
              'dest': '/',
              'stripcomponents': 0
            }]
          }
        },

        // CDN will replace local paths with your Cloud CDN path
        cdn: {
          options: {
            cdn: 'Rackspace Cloud CDN URI', // Change this
            flatten: true,
            supportedTypes: 'html'
          },
          dist: {
            src: ['./dist/*.html']
          }
        }

    });

    // Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('assemble');
    grunt.loadNpmTasks('grunt-mailgun');
    grunt.loadNpmTasks('grunt-premailer');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-cloudfiles');
    grunt.loadNpmTasks('grunt-cdn');

    // Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['assemble', 'premailer']);

    // Use grunt send if you want to actually send the email to your inbox
    grunt.registerTask('send', ['mailgun']);

    // Upload images to our CDN on Rackspace Cloud Files
    grunt.registerTask('cdnify', ['default','cloudfiles','cdn']);

};
