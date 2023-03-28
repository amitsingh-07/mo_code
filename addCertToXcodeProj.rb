require 'xcodeproj'
project_path = 'ios/App/App.xcodeproj'
project = Xcodeproj::Project.open(project_path)
main_group = project.main_group['App']
folder = main_group['www']
if (!folder)
    certificates_path = 'www'
    certificates_ref = main_group.new_reference(certificates_path, :group)
    main_target = project.targets.first
    main_target.add_resources([certificates_ref])
    project.save
end